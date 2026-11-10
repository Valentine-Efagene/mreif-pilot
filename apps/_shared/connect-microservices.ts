import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Transport } from '@nestjs/microservices';
import {
  MOFI_NOTIFICATIONS_QUEUE,
  MOFI_VERIFIER_LAMBDA_QUEUE,
  isDomainCommandConsumerRole,
} from '../../libs/messaging/src';
import {
  buildDomainCommandsConsumerOptions,
  buildRmqMicroserviceOptions,
} from '../../libs/messaging/src/rmq-config';
import { ensureMofiRmqDeadLetterTopology } from '../../libs/messaging/src/rmq-topology';

export type WorkerQueues = 'notifications' | 'verifier' | 'all';

export function shouldStartWorkerQueueConsumers(
  config: ConfigService,
): boolean {
  const runtime = config.get<string>('MOFI_RUNTIME', 'domain');
  if (runtime !== 'worker') {
    return false;
  }
  const worker = config.get<string>('MOFI_WORKER_QUEUES', 'all');
  return worker !== 'none';
}

export async function connectMofiMicroservices(
  app: INestApplication,
  config: ConfigService,
): Promise<void> {
  const runtime = config.get<string>('MOFI_RUNTIME', 'domain');
  const containerRole = config.get<string>('MOFI_CONTAINER_ROLE', '');

  if (runtime === 'edge') {
    return;
  }

  try {
    await ensureMofiRmqDeadLetterTopology(config);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(
      `RMQ DLQ topology failed (check broker version >= 3.13 and queue migrations): ${msg}`,
    );
    throw err;
  }

  if (runtime === 'domain') {
    if (isDomainCommandConsumerRole(containerRole)) {
      app.connectMicroservice({
        transport: Transport.RMQ,
        options: buildDomainCommandsConsumerOptions(config, containerRole),
      });
    }
    await startMicroservicesSafely(app);
    return;
  }

  if (!shouldStartWorkerQueueConsumers(config)) {
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

  await startMicroservicesSafely(app);
}

async function startMicroservicesSafely(app: INestApplication): Promise<void> {
  try {
    await app.startAllMicroservices();
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(
      `RMQ microservices failed to start (HTTP will still listen): ${msg}`,
    );
  }
}
