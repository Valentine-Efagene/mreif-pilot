import { MOFI_NOTIFICATIONS_QUEUE } from '../../libs/messaging/src/message-envelope';
import { rabbitManagementAuthHeader, rabbitMgmtBaseUrl } from './messaging-test-env';

export type QueueSnapshot = {
  messages_ready: number;
  messages_unacknowledged: number;
  ackTotal: number;
};

type RabbitQueueResponse = {
  messages_ready?: number;
  messages_unacknowledged?: number;
  message_stats?: {
    ack?: number;
    deliver?: number;
    deliver_get?: number;
  };
};

function queueAckTotal(stats?: RabbitQueueResponse['message_stats']): number {
  if (!stats) {
    return 0;
  }
  return stats.ack ?? 0;
}

export async function purgeNotificationsQueue(): Promise<void> {
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
    ackTotal: queueAckTotal(data.message_stats),
  };
}

/**
 * Waits until at least `expectedAckDelta` additional acks vs baseline and the queue is idle.
 */
export async function waitForNotificationQueueConsumed(
  baseline: QueueSnapshot,
  expectedAckDelta: number,
  timeoutMs = 90_000,
): Promise<QueueSnapshot> {
  const deadline = Date.now() + timeoutMs;
  let last: QueueSnapshot = baseline;

  while (Date.now() < deadline) {
    last = await fetchNotificationQueueSnapshot();
    const ackDelta = last.ackTotal - baseline.ackTotal;
    const idle =
      last.messages_ready === 0 && last.messages_unacknowledged === 0;

    if (ackDelta >= expectedAckDelta && idle) {
      return last;
    }

    if (last.messages_unacknowledged > 0) {
      await new Promise((r) => setTimeout(r, 500));
      continue;
    }

    if (ackDelta >= expectedAckDelta) {
      return last;
    }

    await new Promise((r) => setTimeout(r, 400));
  }

  const ackDelta = last.ackTotal - baseline.ackTotal;
  throw new Error(
    `Timed out waiting for ${expectedAckDelta} notification ack(s) on ${MOFI_NOTIFICATIONS_QUEUE} (ackDelta=${ackDelta}, ready=${last.messages_ready}, unacked=${last.messages_unacknowledged})`,
  );
}
