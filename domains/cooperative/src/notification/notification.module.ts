import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [NotificationService],
  controllers: [],
  exports: [NotificationService],
})

export class NotificationModule { }
