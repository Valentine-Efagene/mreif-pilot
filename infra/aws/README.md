# MOFI Platform API — AWS CDK

Deploys ECS Fargate, ALB, ECR, Secrets Manager, and CloudWatch logs for the pilot monolith.

## Prerequisites

- AWS CLI configured
- Docker image pushed to the ECR repo (tag `latest`) after first deploy creates the repository

## Commands

From this directory (`infra/aws`):

```bash
npm install
export CDK_DEFAULT_ACCOUNT=123456789012
# Region defaults to us-east-1 in bin/mofi-platform-api.ts; set CDK_DEFAULT_REGION to override.
npx cdk synth -c stage=dev
npx cdk deploy -c stage=dev
```

Bootstrap (once per account/region), if needed:

```bash
npx cdk bootstrap aws://$CDK_DEFAULT_ACCOUNT/us-east-1
```

Populate secrets:

- `mofi-platform-api/{stage}/app` — DB, JWT, optional S3
- `mofi-platform-api/{stage}/rabbitmq` — Amazon MQ password (username `mofi`)

Deploy modes:

- `npx cdk deploy -c stage=dev` — **monolith** Fargate + RDS MySQL (default for dev; fits one task)
- `npx cdk deploy -c stage=dev -c deploymentMode=multicontainer` — 8-container task (needs large Fargate size)

Cutover runbook: [CUTOVER.md](./CUTOVER.md)

Gateway authorizer + Fargate: [GATEWAY-AUTH.md](./GATEWAY-AUTH.md)

## Outputs

- **LoadBalancerDns** — point API Gateway or Route53 at this host (future cutover)
- **EcrRepositoryUri** — push container images here
