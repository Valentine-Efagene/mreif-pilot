import * as Joi from 'joi';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MofiAuthModule } from '../../../libs/auth/src/auth.module';
import { PlatformNotificationsModule } from '../../../libs/notifications/src/notifications.module';
import { PmbDomainModule } from '../../../domains/pmb/src/pmb-domain.module';
import { createDomainHealthController } from '../../../libs/common/src/domain-health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MofiAuthModule.forRoot(),
    PlatformNotificationsModule,
    PmbDomainModule,
  ],
  controllers: [createDomainHealthController('pmb')],
})
export class PmbAppModule {}
