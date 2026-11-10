import { ConfigService } from '@nestjs/config';
import {
  buildWorkQueueDeclareOptions,
  deadLetterQueueName,
  resolveMofiRmqDeliveryLimit,
} from './rmq-queue-policy';

describe('rmq-queue-policy', () => {
  it('names dead-letter queues with .dlq suffix', () => {
    expect(deadLetterQueueName('mofi.notifications.commands')).toBe(
      'mofi.notifications.commands.dlq',
    );
  });

  it('builds delivery-limit and DLQ routing arguments', () => {
    const opts = buildWorkQueueDeclareOptions('mofi.notifications.commands', 3);
    expect(opts.durable).toBe(true);
    expect(opts.arguments).toMatchObject({
      'x-dead-letter-exchange': '',
      'x-dead-letter-routing-key': 'mofi.notifications.commands.dlq',
      'x-delivery-limit': 3,
    });
  });

  it('resolves delivery limit from config', () => {
    const config = new ConfigService({ MOFI_RMQ_DELIVERY_LIMIT: '10' });
    expect(resolveMofiRmqDeliveryLimit(config)).toBe(10);
  });

  it('falls back to default for invalid delivery limit', () => {
    const config = new ConfigService({ MOFI_RMQ_DELIVERY_LIMIT: 'nope' });
    expect(resolveMofiRmqDeliveryLimit(config)).toBe(5);
  });
});
