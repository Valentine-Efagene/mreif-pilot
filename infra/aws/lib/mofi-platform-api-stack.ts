import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import * as amazonmq from 'aws-cdk-lib/aws-amazonmq';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

/** Initial schema name (RDS allows alphanumeric only; app default is qshelter-dev locally). */
const RDS_DATABASE_NAME = 'qshelterdev';

export interface MofiPlatformApiStackProps extends cdk.StackProps {
  stage: string;
}

type ContainerRole =
  | 'edge'
  | 'agent'
  | 'pmb'
  | 'rsa'
  | 'developer'
  | 'uploader'
  | 'cooperative'
  | 'worker';

const MULTI_CONTAINER_ROLES: Array<{
  role: ContainerRole;
  port: number;
  essential: boolean;
  exposePort: boolean;
  healthPath: string;
}> = [
  { role: 'edge', port: 8080, essential: true, exposePort: true, healthPath: '/health' },
  { role: 'agent', port: 3001, essential: true, exposePort: false, healthPath: '/agent/health' },
  { role: 'pmb', port: 3002, essential: true, exposePort: false, healthPath: '/pmb/health' },
  { role: 'rsa', port: 3003, essential: true, exposePort: false, healthPath: '/rsa/health' },
  { role: 'developer', port: 3004, essential: true, exposePort: false, healthPath: '/developer/health' },
  { role: 'uploader', port: 3005, essential: true, exposePort: false, healthPath: '/uploader/health' },
  { role: 'cooperative', port: 3006, essential: true, exposePort: false, healthPath: '/cooperative/health' },
  { role: 'worker', port: 3007, essential: true, exposePort: false, healthPath: '/health' },
];

export class MofiPlatformApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: MofiPlatformApiStackProps) {
    super(scope, id, props);

    const { stage } = props;

    const vpc = new ec2.Vpc(this, 'Vpc', {
      maxAzs: 2,
      natGateways: stage === 'main' ? 2 : 1,
    });

    const cluster = new ecs.Cluster(this, 'Cluster', {
      vpc,
      containerInsights: true,
    });

    // Repo is retained on stack delete (RemovalPolicy.RETAIN); re-use it on redeploy.
    const repository = ecr.Repository.fromRepositoryName(
      this,
      'ApiRepository',
      `mofi-platform-api-${stage}`,
    );

    const appSecret = new secretsmanager.Secret(this, 'AppSecret', {
      secretName: `mofi-platform-api/${stage}/app`,
      description: 'JWT and app credentials for MOFI platform API (DB from RDS secret)',
      generateSecretString: {
        secretStringTemplate: JSON.stringify({
          AMQP_USERNAME: 'mofi',
        }),
        generateStringKey: 'JWT_SECRET',
        excludePunctuation: true,
      },
    });

    const database = new rds.DatabaseInstance(this, 'Database', {
      engine: rds.DatabaseInstanceEngine.mysql({
        version: rds.MysqlEngineVersion.VER_8_4_10,
      }),
      instanceType:
        stage === 'main'
          ? ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.SMALL)
          : ec2.InstanceType.of(ec2.InstanceClass.T4G, ec2.InstanceSize.MICRO),
      vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
      credentials: rds.Credentials.fromGeneratedSecret('mofiadmin', {
        secretName: `mofi-platform-api/${stage}/db`,
      }),
      databaseName: RDS_DATABASE_NAME,
      storageEncrypted: true,
      allocatedStorage: 20,
      maxAllocatedStorage: 100,
      publiclyAccessible: false,
      removalPolicy:
        stage === 'main' ? cdk.RemovalPolicy.SNAPSHOT : cdk.RemovalPolicy.DESTROY,
      deletionProtection: stage === 'main',
      backupRetention: cdk.Duration.days(stage === 'main' ? 7 : 1),
    });

    const brokerSecret = new secretsmanager.Secret(this, 'BrokerSecret', {
      secretName: `mofi-platform-api/${stage}/rabbitmq`,
      description: 'Amazon MQ RabbitMQ credentials',
      generateSecretString: {
        secretStringTemplate: JSON.stringify({ username: 'mofi' }),
        generateStringKey: 'password',
        excludePunctuation: true,
      },
    });

    const logGroup = new logs.LogGroup(this, 'ApiLogGroup', {
      logGroupName: `/ecs/mofi-platform-api-${stage}`,
      retention: logs.RetentionDays.TWO_WEEKS,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const taskSg = new ec2.SecurityGroup(this, 'TaskSecurityGroup', {
      vpc,
      description: 'MOFI platform ECS tasks',
      allowAllOutbound: true,
    });

    database.connections.allowDefaultPortFrom(taskSg);

    const uploadsBucket = new s3.Bucket(this, 'UploadsBucket', {
      bucketName: `mofi-platform-uploads-${stage}-${this.account}`,
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      enforceSSL: true,
      versioned: stage === 'main',
      removalPolicy:
        stage === 'main' ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: stage !== 'main',
    });

    const brokerSg = new ec2.SecurityGroup(this, 'BrokerSecurityGroup', {
      vpc,
      description: 'Amazon MQ RabbitMQ broker',
      allowAllOutbound: true,
    });
    brokerSg.addIngressRule(taskSg, ec2.Port.tcp(5671), 'AMQPS from ECS tasks');
    brokerSg.addIngressRule(taskSg, ec2.Port.tcp(5672), 'AMQP from ECS tasks');

    const broker = new amazonmq.CfnBroker(this, 'RabbitBroker', {
      brokerName: `mofi-rmq-${stage}`.slice(0, 50),
      engineType: 'RabbitMQ',
      engineVersion: '3.13',
      // mq.t3.micro is deprecated and not available for new RabbitMQ brokers (AWS as of 2026).
      hostInstanceType: stage === 'main' ? 'mq.m5.large' : 'mq.m7g.medium',
      deploymentMode: 'SINGLE_INSTANCE',
      publiclyAccessible: false,
      subnetIds: [vpc.privateSubnets[0].subnetId],
      securityGroups: [brokerSg.securityGroupId],
      users: [
        {
          username: 'mofi',
          password: brokerSecret.secretValueFromJson('password').unsafeUnwrap(),
        },
      ],
    });

    const taskRole = new iam.Role(this, 'TaskRole', {
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
    });

    appSecret.grantRead(taskRole);
    brokerSecret.grantRead(taskRole);
    const dbSecret = database.secret;
    if (dbSecret) {
      dbSecret.grantRead(taskRole);
    }
    uploadsBucket.grantReadWrite(taskRole);
    taskRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ['lambda:InvokeFunction'],
        resources: ['arn:aws:lambda:*:*:function:*'],
      }),
    );

    const taskDefinition = new ecs.FargateTaskDefinition(this, 'TaskDef', {
      // Eight Node processes share task memory; 16 GiB caused exit 137 during parallel TypeORM startup.
      memoryLimitMiB: stage === 'main' ? 30720 : 61440,
      cpu: stage === 'main' ? 4096 : 8192,
      taskRole,
    });

    const image = ecs.ContainerImage.fromEcrRepository(repository, 'latest');

    const stackRegion = cdk.Stack.of(this).region;

    const sharedEnvironment: Record<string, string> = {
      NODE_ENV: stage === 'main' ? 'production' : 'development',
      MOFI_STAGE: stage,
      AUTH_ENFORCEMENT: 'gateway',
      MESSAGING_ENABLED: 'true',
      NOTIFICATION_MODE: 'async',
      LAMBDA_INVOKE_MODE: 'async',
      // Never run schema sync from eight containers against one RDS task (race + memory spike).
      TYPEORM_SYNCHRONIZE: 'false',
      NODE_OPTIONS: '--max-old-space-size=1400',
      AMQP_VHOST: '/',
      AMQP_USERNAME: 'mofi',
      AMQP_URL: cdk.Token.asString(cdk.Fn.select(0, broker.attrAmqpEndpoints)),
      AWS_S3_BUCKET_NAME: uploadsBucket.bucketName,
      AWS_S3_REGION: stackRegion,
      CUSTOM_AWS_S3_BUCKET_NAME: uploadsBucket.bucketName,
      CUSTOM_AWS_REGION: stackRegion,
    };

    if (!dbSecret) {
      throw new Error('RDS instance secret is required for ECS database configuration');
    }

    const sharedSecrets: Record<string, ecs.Secret> = {
      DB_HOST: ecs.Secret.fromSecretsManager(dbSecret, 'host'),
      DB_PORT: ecs.Secret.fromSecretsManager(dbSecret, 'port'),
      DB_USERNAME: ecs.Secret.fromSecretsManager(dbSecret, 'username'),
      DB_PASSWORD: ecs.Secret.fromSecretsManager(dbSecret, 'password'),
      JWT_SECRET: ecs.Secret.fromSecretsManager(appSecret, 'JWT_SECRET'),
      AMQP_PASSWORD: ecs.Secret.fromSecretsManager(brokerSecret, 'password'),
    };

    const addContainer = (
      name: string,
      role: ContainerRole,
      port: number,
      essential: boolean,
      exposePort: boolean,
      healthPath: string,
      extraEnv: Record<string, string> = {},
    ) => {
      const container = taskDefinition.addContainer(name, {
        image,
        essential,
        logging: ecs.LogDrivers.awsLogs({ streamPrefix: name, logGroup }),
        environment: {
          ...sharedEnvironment,
          MOFI_CONTAINER_ROLE: role,
          PORT: String(port),
          DB_NAME: RDS_DATABASE_NAME,
          ...extraEnv,
        },
        secrets: sharedSecrets,
        healthCheck: {
          command: [
            'CMD-SHELL',
            `wget -qO- http://127.0.0.1:${port}${healthPath} || exit 1`,
          ],
          interval: cdk.Duration.seconds(30),
          timeout: cdk.Duration.seconds(5),
          retries: 3,
          startPeriod: cdk.Duration.seconds(240),
        },
      });
      if (exposePort) {
        container.addPortMappings({ containerPort: port });
      }
      return container;
    };

    for (const spec of MULTI_CONTAINER_ROLES) {
      const extraEnv: Record<string, string> = {
        MOFI_RUNTIME: spec.role === 'edge' ? 'edge' : spec.role === 'worker' ? 'worker' : 'domain',
        MOFI_WORKER_QUEUES: spec.role === 'worker' ? 'all' : 'none',
      };
      if (spec.role === 'edge') {
        extraEnv.AGENT_UPSTREAM = 'http://127.0.0.1:3001';
        extraEnv.PMB_UPSTREAM = 'http://127.0.0.1:3002';
        extraEnv.RSA_UPSTREAM = 'http://127.0.0.1:3003';
        extraEnv.DEVELOPER_UPSTREAM = 'http://127.0.0.1:3004';
        extraEnv.UPLOADER_UPSTREAM = 'http://127.0.0.1:3005';
        extraEnv.COOPERATIVE_UPSTREAM = 'http://127.0.0.1:3006';
      }
      addContainer(
        spec.role,
        spec.role,
        spec.port,
        spec.essential,
        spec.exposePort,
        spec.healthPath,
        extraEnv,
      );
    }

    const service = new ecs.FargateService(this, 'Service', {
      cluster,
      taskDefinition,
      desiredCount: stage === 'main' ? 2 : 1,
      assignPublicIp: true,
      securityGroups: [taskSg],
      circuitBreaker: { rollback: stage === 'main' },
      healthCheckGracePeriod: cdk.Duration.seconds(420),
    });

    service.node.addDependency(broker);
    service.node.addDependency(database);

    const alb = new elbv2.ApplicationLoadBalancer(this, 'Alb', {
      vpc,
      internetFacing: true,
      idleTimeout: cdk.Duration.seconds(120),
    });

    const listener = alb.addListener('HttpListener', {
      port: 80,
      open: true,
    });

    listener.addTargets('EcsTarget', {
      port: 8080,
      protocol: elbv2.ApplicationProtocol.HTTP,
      targets: [service],
      healthCheck: {
        path: '/health',
        healthyHttpCodes: '200',
      },
    });

    new cdk.CfnOutput(this, 'LoadBalancerDns', { value: alb.loadBalancerDnsName });
    new cdk.CfnOutput(this, 'EcrRepositoryUri', { value: repository.repositoryUri });
    new cdk.CfnOutput(this, 'ClusterName', { value: cluster.clusterName });
    new cdk.CfnOutput(this, 'SecretArn', { value: appSecret.secretArn });
    new cdk.CfnOutput(this, 'DbSecretArn', { value: dbSecret.secretArn });
    new cdk.CfnOutput(this, 'DbEndpoint', { value: database.dbInstanceEndpointAddress });
    new cdk.CfnOutput(this, 'UploadsBucketName', { value: uploadsBucket.bucketName });
    new cdk.CfnOutput(this, 'BrokerSecretArn', { value: brokerSecret.secretArn });
    new cdk.CfnOutput(this, 'RuntimeLayout', { value: 'multicontainer' });
  }
}
