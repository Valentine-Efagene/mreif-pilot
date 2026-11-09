import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MofiAuthModule } from '../../../libs/auth/src/auth.module';
import { PlatformNotificationsModule } from '../../../libs/notifications/src/notifications.module';
import { createDomainHealthController } from '../../../libs/common/src/domain-health.controller';
import { PmbDomainModule } from './pmb-domain.module';

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
