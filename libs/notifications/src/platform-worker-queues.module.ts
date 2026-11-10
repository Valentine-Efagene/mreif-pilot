import { BullModule } from '@nestjs/bullmq';
import { DynamicModule, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import {
  MOFI_NOTIFICATIONS_QUEUE,
  MOFI_VERIFIER_LAMBDA_QUEUE,
} from '../../messaging/src/message-envelope';
import { LambdaInvokeQueueProcessor } from './lambda-invoke-queue.processor';
import { NotificationQueueProcessor } from './notification-queue.processor';

export type WorkerQueues = 'notifications' | 'verifier' | 'all' | 'none';

@Module({})
export class PlatformWorkerQueuesModule {
  static forWorker(
    queues: WorkerQueues = (process.env.MOFI_WORKER_QUEUES as WorkerQueues) ??
      'all',
  ): DynamicModule {
    const imports: DynamicModule['imports'] = [HttpModule.register({ timeout: 60_000 })];
    const providers: DynamicModule['providers'] = [];

    if (queues === 'all' || queues === 'notifications') {
      imports.push(BullModule.registerQueue({ name: MOFI_NOTIFICATIONS_QUEUE }));
      providers.push(NotificationQueueProcessor);
    }
    if (queues === 'all' || queues === 'verifier') {
      imports.push(BullModule.registerQueue({ name: MOFI_VERIFIER_LAMBDA_QUEUE }));
      providers.push(LambdaInvokeQueueProcessor);
    }

    return {
      module: PlatformWorkerQueuesModule,
      imports,
      providers,
    };
  }
}
