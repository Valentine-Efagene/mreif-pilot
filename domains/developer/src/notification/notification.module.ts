import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { PropertyController } from './notification.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [NotificationService],
  controllers: [PropertyController],
  exports: [NotificationService]
})

export class NotificationModule { }
