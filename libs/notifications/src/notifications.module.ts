import { Global, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MofiMessagingModule } from '../../messaging/src/messaging.module';
import { PlatformNotificationService } from './platform-notification.service';
import { NotificationQueueController } from './notification-queue.controller';
import { PlatformLambdaInvokeService } from './platform-lambda-invoke.service';
import { LambdaInvokeQueueController } from './lambda-invoke-queue.controller';

@Global()
@Module({
  imports: [HttpModule, MofiMessagingModule],
  providers: [PlatformNotificationService, PlatformLambdaInvokeService],
  controllers: [NotificationQueueController, LambdaInvokeQueueController],
  exports: [PlatformNotificationService, PlatformLambdaInvokeService],
})
export class PlatformNotificationsModule {}
