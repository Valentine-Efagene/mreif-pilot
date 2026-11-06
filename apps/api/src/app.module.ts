import * as Joi from 'joi';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RouterModule } from '@nestjs/core';
import { DatabaseModule } from '../../../libs/database/src/database.module';
import { MofiAuthModule } from '../../../libs/auth/src/auth.module';
import { PlatformNotificationsModule } from '../../../libs/notifications/src/notifications.module';
import { AgentDomainModule } from '../../../domains/agent/src/agent-domain.module';
import { PmbDomainModule } from '../../../domains/pmb/src/pmb-domain.module';
import { RsaDomainModule } from '../../../domains/rsa/src/rsa-domain.module';
import { DeveloperDomainModule } from '../../../domains/developer/src/developer-domain.module';
import { UploaderDomainModule } from '../../../domains/uploader/src/uploader-domain.module';
import { CooperativeDomainModule } from '../../../domains/cooperative/src/cooperative-domain.module';
import { PlatformHealthController } from './platform-health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'production' ? undefined : '.env',
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test', 'provision')
          .default('development'),
        PORT: Joi.number().port().default(8080),
        DB_HOST: Joi.string().optional(),
        DB_PORT: Joi.number().port().default(3306),
        DB_USERNAME: Joi.string().optional(),
        DB_PASSWORD: Joi.string().allow('').optional(),
        DB_NAME: Joi.string().optional(),
        AWS_S3_BUCKET_NAME: Joi.string().optional(),
        AWS_S3_ACCESS_KEY_ID: Joi.string().optional(),
        AWS_S3_SECRET_ACCESS_KEY: Joi.string().optional(),
        AWS_S3_REGION: Joi.string().default('us-east-1'),
        CUSTOM_AWS_S3_BUCKET_NAME: Joi.string().optional(),
        CUSTOM_AWS_ACCESS_KEY_ID: Joi.string().optional(),
        CUSTOM_AWS_SECRET_ACCESS_KEY: Joi.string().optional(),
        CUSTOM_AWS_REGION: Joi.string().default('us-east-1'),
        CUSTOM_AWS_ENDPOINT: Joi.string().uri().optional(),
        CUSTOM_AWS_FORCE_PATH_STYLE: Joi.string().valid('true', 'false', '1', '0', 'yes', 'no').optional(),
        PRESIGNED_URL_TTL: Joi.number().integer().default(3600),
        JWT_SECRET: Joi.string().optional(),
        NOTIFICATION_URL: Joi.string().uri().optional(),
        NOTIFICATION_MODE: Joi.string().valid('sync', 'async').default('sync'),
        LAMBDA_INVOKE_MODE: Joi.string().valid('sync', 'async').default('sync'),
        MESSAGING_ENABLED: Joi.string().valid('true', 'false').default('false'),
        AMQP_URL: Joi.string().uri().optional(),
        AMQP_HOST: Joi.string().optional(),
        AMQP_PORT: Joi.number().optional(),
        AMQP_USERNAME: Joi.string().optional(),
        AMQP_PASSWORD: Joi.string().optional(),
        AMQP_VHOST: Joi.string().optional(),
        MOFI_RUNTIME: Joi.string()
          .valid('monolith', 'edge', 'domain', 'worker')
          .default('monolith'),
        MOFI_WORKER_QUEUES: Joi.string()
          .valid('all', 'notifications', 'verifier', 'none')
          .default('all'),
        AUTH_ENFORCEMENT: Joi.string().valid('gateway', 'local').default('local'),
      }),
    }),
    DatabaseModule,
    MofiAuthModule.forRoot(),
    PlatformNotificationsModule,
    AgentDomainModule,
    PmbDomainModule,
    RsaDomainModule,
    DeveloperDomainModule,
    UploaderDomainModule,
    CooperativeDomainModule,
    RouterModule.register([
      { path: 'agent', module: AgentDomainModule },
      { path: 'pmb', module: PmbDomainModule },
      { path: 'rsa', module: RsaDomainModule },
      { path: 'developer', module: DeveloperDomainModule },
      { path: 'uploader', module: UploaderDomainModule },
      { path: 'cooperative', module: CooperativeDomainModule },
    ]),
  ],
  controllers: [PlatformHealthController],
})
export class AppModule {}
