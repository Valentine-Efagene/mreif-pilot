import { Queue } from 'bullmq';
import { DOMAIN_COMMAND_CONSUMER_ROLES } from '../../libs/messaging/src/domain-commands';
import { domainCommandsQueueName } from '../../libs/messaging/src/domain-commands';
import {
  MOFI_NOTIFICATIONS_QUEUE,
  MOFI_VERIFIER_LAMBDA_QUEUE,
} from '../../libs/messaging/src/message-envelope';
import { MOFI_BULL_KEY_PREFIX } from '../../libs/messaging/src/valkey-config';

export type QueueSnapshot = {
  waiting: number;
  active: number;
  completed: number;
  failed: number;
};

function valkeyConnection(): { host: string; port: number } {
  return {
    host: process.env.REDIS_HOST ?? '127.0.0.1',
    port: Number(process.env.REDIS_PORT ?? 6379),
  };
}

export function listMofiBullQueues(): string[] {
  return [
    MOFI_NOTIFICATIONS_QUEUE,
    MOFI_VERIFIER_LAMBDA_QUEUE,
    ...DOMAIN_COMMAND_CONSUMER_ROLES.map((domain) =>
      domainCommandsQueueName(domain),
    ),
  ];
}

function openQueue(name: string): Queue {
  return new Queue(name, {
    connection: { ...valkeyConnection(), maxRetriesPerRequest: null },
    prefix: MOFI_BULL_KEY_PREFIX,
  });
}

export function queuePending(snapshot: QueueSnapshot): number {
  return snapshot.waiting + snapshot.active;
}

export async function recreateMofiWorkQueuesForTests(): Promise<void> {
  for (const name of listMofiBullQueues()) {
    const queue = openQueue(name);
    try {
      await queue.obliterate({ force: true });
    } finally {
      await queue.close();
    }
  }
}

export async function purgeNotificationsQueue(): Promise<void> {
  const queue = openQueue(MOFI_NOTIFICATIONS_QUEUE);
  try {
    await queue.obliterate({ force: true });
  } finally {
    await queue.close();
  }
}

export async function fetchNotificationQueueSnapshot(): Promise<QueueSnapshot> {
  const queue = openQueue(MOFI_NOTIFICATIONS_QUEUE);
  try {
    const counts = await queue.getJobCounts(
      'waiting',
      'active',
      'completed',
      'failed',
    );
    return {
      waiting: counts.waiting ?? 0,
      active: counts.active ?? 0,
      completed: counts.completed ?? 0,
      failed: counts.failed ?? 0,
    };
  } finally {
    await queue.close();
  }
}

/**
 * Waits until the worker completed at least `expectedCompletedDelta` more jobs vs baseline.
 */
export async function waitForNotificationQueueConsumed(
  baseline: QueueSnapshot,
  expectedCompletedDelta: number,
  timeoutMs = 90_000,
): Promise<QueueSnapshot> {
  const deadline = Date.now() + timeoutMs;
  let last: QueueSnapshot = baseline;

  while (Date.now() < deadline) {
    last = await fetchNotificationQueueSnapshot();
    const completedDelta = last.completed - baseline.completed;

    if (completedDelta >= expectedCompletedDelta) {
      return last;
    }

    await new Promise((r) => setTimeout(r, 400));
  }

  const completedDelta = last.completed - baseline.completed;
  throw new Error(
    `Timed out waiting for ${expectedCompletedDelta} notification job completion(s) on ${MOFI_NOTIFICATIONS_QUEUE} (completedDelta=${completedDelta}, waiting=${last.waiting}, active=${last.active})`,
  );
}

/** No-op for Bull (no stale consumer tags). */
export function cancelNotificationsQueueConsumers(): void {}
