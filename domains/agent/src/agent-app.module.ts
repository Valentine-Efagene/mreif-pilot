import * as Joi from 'joi';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MofiAuthModule } from '../../../libs/auth/src/auth.module';
import { PlatformNotificationsModule } from '../../../libs/notifications/src/notifications.module';
import { AgentDomainModule } from './agent-domain.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'production' ? undefined : '.env',
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().default('development'),
        PORT: Joi.number().port().default(3001),
        MOFI_RUNTIME: Joi.string().default('domain'),
        MOFI_WORKER_QUEUES: Joi.string().default('none'),
        MESSAGING_ENABLED: Joi.string().valid('true', 'false').default('false'),
      }),
    }),
    MofiAuthModule.forRoot(),
    PlatformNotificationsModule,
    AgentDomainModule,
  ],
})
export class AgentAppModule {}
