import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PlatformNotificationsModule } from '../../../libs/notifications/src/notifications.module';
import { WorkerHealthController } from './worker-health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'production' ? undefined : '.env',
    }),
    PlatformNotificationsModule,
  ],
  controllers: [WorkerHealthController],
})
export class WorkerAppModule {}
