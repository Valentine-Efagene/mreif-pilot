import { execSync } from 'child_process';
import { MOFI_NOTIFICATIONS_QUEUE } from '../../libs/messaging/src/message-envelope';
import { rabbitManagementAuthHeader, rabbitMgmtBaseUrl } from './messaging-test-env';

export type QueueSnapshot = {
  messages_ready: number;
  messages_unacknowledged: number;
  deliverGetTotal: number;
};

type RabbitQueueResponse = {
  messages_ready?: number;
  messages_unacknowledged?: number;
  message_stats?: {
    deliver_get?: number;
  };
};

function deliverGetTotal(stats?: RabbitQueueResponse['message_stats']): number {
  return stats?.deliver_get ?? 0;
}

export function queuePending(snapshot: QueueSnapshot): number {
  return snapshot.messages_ready + snapshot.messages_unacknowledged;
}

/** Drop stale consumers from prior test runs so unacked messages do not block the queue. */
export function cancelNotificationsQueueConsumers(): void {
  const vhost = process.env.AMQP_VHOST ?? 'mofi';
  try {
    const listing = execSync(
      `docker exec mofi-test-rabbitmq rabbitmqctl list_consumers queue_name consumer_tag -p ${vhost} --formatter json`,
      { encoding: 'utf8' },
    );
    const rows = JSON.parse(listing) as Array<{
      queue_name?: string;
      consumer_tag?: string;
    }>;
    for (const row of rows) {
      if (
        row.queue_name !== MOFI_NOTIFICATIONS_QUEUE ||
        !row.consumer_tag
      ) {
        continue;
      }
      execSync(
        `docker exec mofi-test-rabbitmq rabbitmqctl cancel_consumer -p ${vhost} ${MOFI_NOTIFICATIONS_QUEUE} ${row.consumer_tag}`,
        { stdio: 'ignore' },
      );
    }
  } catch {
    // best-effort (no docker / older rabbitmqctl)
  }
}

/** Purge ready messages; prefer `rabbitmqctl` on local test compose for full purge. */
export async function purgeNotificationsQueue(): Promise<void> {
  cancelNotificationsQueueConsumers();
  try {
    execSync(
      `docker exec mofi-test-rabbitmq rabbitmqctl purge_queue -p ${process.env.AMQP_VHOST ?? 'mofi'} ${MOFI_NOTIFICATIONS_QUEUE}`,
      { stdio: 'ignore' },
    );
    return;
  } catch {
    // fall through to management API (ready messages only)
  }

  const vhost = encodeURIComponent(process.env.AMQP_VHOST ?? 'mofi');
  const queue = encodeURIComponent(MOFI_NOTIFICATIONS_QUEUE);
  const res = await fetch(
    `${rabbitMgmtBaseUrl()}/api/queues/${vhost}/${queue}/contents`,
    {
      method: 'DELETE',
      headers: { Authorization: rabbitManagementAuthHeader() },
    },
  );
  if (!res.ok && res.status !== 204) {
    const text = await res.text();
    throw new Error(
      `Failed to purge ${MOFI_NOTIFICATIONS_QUEUE} (${res.status}): ${text.slice(0, 300)}`,
    );
  }
}

export async function fetchNotificationQueueSnapshot(): Promise<QueueSnapshot> {
  const vhost = encodeURIComponent(process.env.AMQP_VHOST ?? 'mofi');
  const queue = encodeURIComponent(MOFI_NOTIFICATIONS_QUEUE);
  const res = await fetch(
    `${rabbitMgmtBaseUrl()}/api/queues/${vhost}/${queue}`,
    { headers: { Authorization: rabbitManagementAuthHeader() } },
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `RabbitMQ management queue lookup failed (${res.status}): ${text.slice(0, 300)}`,
    );
  }
  const data = (await res.json()) as RabbitQueueResponse;
  return {
    messages_ready: data.messages_ready ?? 0,
    messages_unacknowledged: data.messages_unacknowledged ?? 0,
    deliverGetTotal: deliverGetTotal(data.message_stats),
  };
}

/**
 * Waits until the worker delivered at least `expectedDeliverDelta` messages (deliver_get)
 * vs baseline. Prefer also seeing the queue drained (no ready/unacked); when unacked
 * stays high, check for stale Rabbit consumers from prior runs.
 */
export async function waitForNotificationQueueConsumed(
  baseline: QueueSnapshot,
  expectedDeliverDelta: number,
  timeoutMs = 90_000,
): Promise<QueueSnapshot> {
  const deadline = Date.now() + timeoutMs;
  let last: QueueSnapshot = baseline;

  while (Date.now() < deadline) {
    last = await fetchNotificationQueueSnapshot();
    const deliverDelta = last.deliverGetTotal - baseline.deliverGetTotal;

    if (deliverDelta >= expectedDeliverDelta) {
      return last;
    }

    await new Promise((r) => setTimeout(r, 400));
  }

  const deliverDelta = last.deliverGetTotal - baseline.deliverGetTotal;
  throw new Error(
    `Timed out waiting for ${expectedDeliverDelta} notification delivery(ies) on ${MOFI_NOTIFICATIONS_QUEUE} (deliverDelta=${deliverDelta}, ready=${last.messages_ready}, unacked=${last.messages_unacknowledged})`,
  );
}
