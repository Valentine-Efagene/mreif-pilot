import { Global, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MofiMessagingModule } from '../../messaging/src/messaging.module';
import { PlatformNotificationService } from './platform-notification.service';
import { PlatformLambdaInvokeService } from './platform-lambda-invoke.service';

@Global()
@Module({
  imports: [HttpModule.register({ timeout: 60_000 }), MofiMessagingModule],
  providers: [PlatformNotificationService, PlatformLambdaInvokeService],
  exports: [PlatformNotificationService, PlatformLambdaInvokeService],
})
export class PlatformNotificationsModule {}
