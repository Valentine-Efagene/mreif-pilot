import { ConfigService } from '@nestjs/config';

/** Suffix for dead-letter queues paired with primary work queues. */
export const MOFI_DLQ_SUFFIX = '.dlq';

/** Default redeliveries before Rabbit dead-letters (requires RabbitMQ 3.13+). */
export const DEFAULT_MOFI_RMQ_DELIVERY_LIMIT = 5;

export type MofiQueueDeclareOptions = {
  durable: boolean;
  arguments?: Record<string, unknown>;
};

export function deadLetterQueueName(workQueue: string): string {
  return `${workQueue}${MOFI_DLQ_SUFFIX}`;
}

export function resolveMofiRmqDeliveryLimit(
  config: ConfigService,
): number {
  const raw = config.get<string>('MOFI_RMQ_DELIVERY_LIMIT');
  if (raw === undefined || raw === '') {
    return DEFAULT_MOFI_RMQ_DELIVERY_LIMIT;
  }
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return DEFAULT_MOFI_RMQ_DELIVERY_LIMIT;
  }
  return parsed;
}

/**
 * Primary work queue: durable, bounded redeliveries, dead-letter to `*.dlq`
 * via the default exchange (empty `x-dead-letter-exchange`).
 */
export function buildWorkQueueDeclareOptions(
  workQueue: string,
  deliveryLimit: number,
): MofiQueueDeclareOptions {
  const queueArguments: Record<string, unknown> = {
    'x-dead-letter-exchange': '',
    'x-dead-letter-routing-key': deadLetterQueueName(workQueue),
  };
  // Omit when 0 (older brokers / classic queues without x-delivery-limit).
  if (deliveryLimit > 0) {
    queueArguments['x-delivery-limit'] = deliveryLimit;
  }
  return {
    durable: true,
    arguments: queueArguments,
  };
}

export function buildDeadLetterQueueDeclareOptions(): MofiQueueDeclareOptions {
  return { durable: true };
}

/** Work queues get DLQ policy; exchange-backed clients keep durable-only declare. */
export function isExchangeBackedClient(
  extra: { exchange?: string } = {},
): boolean {
  return Boolean(extra.exchange);
}
