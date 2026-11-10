import { ConfigService } from '@nestjs/config';

export type WorkerQueues = 'notifications' | 'verifier' | 'all' | 'none';

export function shouldStartWorkerQueueConsumers(
  config: ConfigService,
): boolean {
  const runtime = config.get<string>('MOFI_RUNTIME', 'domain');
  if (runtime !== 'worker') {
    return false;
  }
  const worker = config.get<string>('MOFI_WORKER_QUEUES', 'all') as WorkerQueues;
  return worker !== 'none';
}

export function workerConsumesNotifications(config: ConfigService): boolean {
  if (!shouldStartWorkerQueueConsumers(config)) {
    return false;
  }
  const worker = config.get<string>('MOFI_WORKER_QUEUES', 'all') as WorkerQueues;
  return worker === 'all' || worker === 'notifications';
}

export function workerConsumesVerifier(config: ConfigService): boolean {
  if (!shouldStartWorkerQueueConsumers(config)) {
    return false;
  }
  const worker = config.get<string>('MOFI_WORKER_QUEUES', 'all') as WorkerQueues;
  return worker === 'all' || worker === 'verifier';
}
