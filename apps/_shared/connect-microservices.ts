import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Transport } from '@nestjs/microservices';
import {
  MOFI_DOMAIN_COMMANDS_QUEUE,
  MOFI_NOTIFICATIONS_QUEUE,
  MOFI_VERIFIER_LAMBDA_QUEUE,
  buildRmqMicroserviceOptions,
  isMessagingEnabled,
} from '../../libs/messaging/src';

export type WorkerQueues = 'notifications' | 'verifier' | 'domain' | 'all';

export function shouldStartQueueConsumers(config: ConfigService): boolean {
  if (!isMessagingEnabled(config)) {
    return false;
  }
  const runtime = config.get<string>('MOFI_RUNTIME', 'domain');
  if (runtime === 'edge' || runtime === 'domain') {
    return false;
  }
  const worker = config.get<string>('MOFI_WORKER_QUEUES', 'all');
  if (worker === 'none') {
    return false;
  }
  return true;
}

export async function connectMofiMicroservices(
  app: INestApplication,
  config: ConfigService,
): Promise<void> {
  if (!shouldStartQueueConsumers(config)) {
    return;
  }

  const worker = config.get<string>('MOFI_WORKER_QUEUES', 'all') as WorkerQueues;

  if (worker === 'all' || worker === 'notifications') {
    app.connectMicroservice({
      transport: Transport.RMQ,
      options: buildRmqMicroserviceOptions(config, MOFI_NOTIFICATIONS_QUEUE),
    });
  }

  if (worker === 'all' || worker === 'verifier') {
    app.connectMicroservice({
      transport: Transport.RMQ,
      options: buildRmqMicroserviceOptions(config, MOFI_VERIFIER_LAMBDA_QUEUE),
    });
  }

  if (worker === 'all' || worker === 'domain') {
    app.connectMicroservice({
      transport: Transport.RMQ,
      options: buildRmqMicroserviceOptions(config, MOFI_DOMAIN_COMMANDS_QUEUE),
    });
  }

  try {
    await app.startAllMicroservices();
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`RMQ microservices failed to start (HTTP will still listen): ${msg}`);
  }
}
