import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PlatformNotificationsModule } from '../../../libs/notifications/src/notifications.module';
import { PlatformWorkerQueuesModule } from '../../../libs/notifications/src/platform-worker-queues.module';
import { WorkerHealthController } from './worker-health.controller';

/**
 * Platform worker: notification HTTP delivery and verifier Lambda invoke only.
 * Domain command consumers run in each domain container (see `DOMAIN_COMMAND_CONSUMER_ROLES`).
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'production' ? undefined : '.env',
    }),
    PlatformNotificationsModule,
    PlatformWorkerQueuesModule.forWorker(),
  ],
  controllers: [WorkerHealthController],
})
export class WorkerAppModule {}
