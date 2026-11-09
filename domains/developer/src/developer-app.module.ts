import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MofiAuthModule } from '../../../libs/auth/src/auth.module';
import { PlatformNotificationsModule } from '../../../libs/notifications/src/notifications.module';
import { createDomainHealthController } from '../../../libs/common/src/domain-health.controller';
import { DeveloperDomainModule } from './developer-domain.module';
import { DeveloperAsyncConsumerModule } from './messaging/developer-async-consumer.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MofiAuthModule.forRoot(),
    PlatformNotificationsModule,
    DeveloperDomainModule,
    DeveloperAsyncConsumerModule,
  ],
  controllers: [createDomainHealthController('developer')],
})
export class DeveloperAppModule {}
