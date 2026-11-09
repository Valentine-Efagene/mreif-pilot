import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PlatformNotificationsModule } from '../../../libs/notifications/src/notifications.module';
import { WorkerHealthController } from './worker-health.controller';
import { DomainCommandsQueueController } from './domain-commands-queue.controller';
import { DeveloperWorkerModule } from './developer-worker.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'production' ? undefined : '.env',
    }),
    PlatformNotificationsModule,
    DeveloperWorkerModule,
  ],
  controllers: [WorkerHealthController, DomainCommandsQueueController],
})
export class WorkerAppModule {}
