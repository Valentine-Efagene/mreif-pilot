import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';
import {
  DOMAIN_COMMAND_CONSUMER_ROLES,
  domainCommandsQueueName,
} from './domain-commands';
import {
  MOFI_NOTIFICATIONS_QUEUE,
  MOFI_VERIFIER_LAMBDA_QUEUE,
} from './message-envelope';
import { getAmqpUrls } from './rmq-config';
import {
  buildDeadLetterQueueDeclareOptions,
  deadLetterQueueName,
} from './rmq-queue-policy';

/** All durable work queues that use {@link buildWorkQueueDeclareOptions}. */
export function listMofiWorkQueues(): string[] {
  return [
    MOFI_NOTIFICATIONS_QUEUE,
    MOFI_VERIFIER_LAMBDA_QUEUE,
    ...DOMAIN_COMMAND_CONSUMER_ROLES.map((domain) =>
      domainCommandsQueueName(domain),
    ),
  ];
}

/** Assert `*.dlq` companions for every MOFI work queue (publisher-safe). */
export async function ensureMofiRmqDeadLetterTopology(
  config: ConfigService,
): Promise<void> {
  await assertMofiDeadLetterQueues(config, listMofiWorkQueues());
}

const logger = new Logger('MofiRmqTopology');

/**
 * Asserts companion `*.dlq` queues before the primary queue is declared by Nest.
 * Primary queues reference these names in `x-dead-letter-routing-key`.
 */
export async function assertMofiDeadLetterQueues(
  config: ConfigService,
  workQueues: string[],
): Promise<void> {
  if (workQueues.length === 0) {
    return;
  }

  const [url] = getAmqpUrls(config);
  let connection: Awaited<ReturnType<typeof amqp.connect>> | undefined;

  try {
    connection = await amqp.connect(url);
    const channel = await connection.createChannel();
    const dlqOptions = buildDeadLetterQueueDeclareOptions();

    for (const workQueue of workQueues) {
      const dlq = deadLetterQueueName(workQueue);
      await channel.assertQueue(dlq, dlqOptions);
      logger.log(`RMQ DLQ ready: ${dlq} (for ${workQueue})`);
    }

    await channel.close();
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.error(
      `Failed to assert MOFI dead-letter queues (${workQueues.join(', ')}): ${msg}`,
    );
    throw err;
  } finally {
    await connection?.close().catch(() => undefined);
  }
}
