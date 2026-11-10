import { ConfigService } from '@nestjs/config';
import {
  MOFI_DOMAIN_COMMANDS_EXCHANGE,
  domainCommandsBindingKey,
  domainCommandsQueueName,
} from './domain-commands';
import {
  buildWorkQueueDeclareOptions,
  isExchangeBackedClient,
  resolveMofiRmqDeliveryLimit,
} from './rmq-queue-policy';

export type MofiRmqOptions = {
  urls: string[];
  queue: string;
  queueOptions?: {
    durable?: boolean;
    arguments?: Record<string, unknown>;
  };
  noAck?: boolean;
  prefetchCount?: number;
  isGlobalPrefetchCount?: boolean;
  wildcards?: boolean;
  exchange?: string;
  exchangeType?: 'direct' | 'fanout' | 'topic' | 'headers';
  routingKey?: string;
};

export function getAmqpUrls(config: ConfigService): string[] {
  const url = config.get<string>('AMQP_URL');
  if (url) {
    const normalized = url.replace(/^amqp\+ssl:/, 'amqps:');
    try {
      const parsed = new URL(normalized);
      const user = config.get<string>('AMQP_USERNAME', 'mofi');
      const pass = config.get<string>('AMQP_PASSWORD', '');
      if (!parsed.username && pass) {
        parsed.username = user;
        parsed.password = pass;
      }
      const vhost = config.get<string>('AMQP_VHOST', '/');
      if (!parsed.pathname || parsed.pathname === '/') {
        parsed.pathname = vhost.startsWith('/') ? vhost : `/${vhost}`;
      }
      return [parsed.toString()];
    } catch {
      return [normalized];
    }
  }
  const host = config.get<string>('AMQP_HOST', '127.0.0.1');
  const port = config.get<string>('AMQP_PORT', '5672');
  const user = config.get<string>('AMQP_USERNAME', 'mofi');
  const pass = config.get<string>('AMQP_PASSWORD', 'mofi');
  const vhost = encodeURIComponent(config.get<string>('AMQP_VHOST', 'mofi'));
  return [`amqp://${user}:${pass}@${host}:${port}/${vhost}`];
}

/** RMQ microservice consumer (worker / domain command handlers). */
export function buildRmqMicroserviceOptions(
  config: ConfigService,
  queue: string,
  extra: Partial<
    Pick<
      MofiRmqOptions,
      'wildcards' | 'exchange' | 'exchangeType' | 'routingKey'
    >
  > = {},
): MofiRmqOptions {
  const deliveryLimit = resolveMofiRmqDeliveryLimit(config);
  return {
    urls: getAmqpUrls(config),
    queue,
    queueOptions: buildWorkQueueDeclareOptions(queue, deliveryLimit),
    noAck: false,
    prefetchCount: 1,
    isGlobalPrefetchCount: true,
    ...extra,
  };
}

/** RMQ ClientProxy publisher (`emit`); reply consumer requires noAck. */
export function buildRmqClientOptions(
  config: ConfigService,
  queue: string,
  extra: Partial<
    Pick<
      MofiRmqOptions,
      'wildcards' | 'exchange' | 'exchangeType' | 'routingKey'
    >
  > = {},
): MofiRmqOptions {
  const deliveryLimit = resolveMofiRmqDeliveryLimit(config);
  const queueOptions = isExchangeBackedClient(extra)
    ? { durable: true }
    : buildWorkQueueDeclareOptions(queue, deliveryLimit);
  return {
    urls: getAmqpUrls(config),
    queue,
    queueOptions,
    noAck: true,
    ...extra,
  };
}

/** Producer client: publish to the topic exchange using the event name as routing key. */
export function buildDomainCommandsProducerOptions(
  config: ConfigService,
): MofiRmqOptions {
  return buildRmqClientOptions(config, MOFI_DOMAIN_COMMANDS_EXCHANGE, {
    wildcards: true,
    exchange: MOFI_DOMAIN_COMMANDS_EXCHANGE,
    exchangeType: 'topic',
  });
}

/** Consumer microservice: durable queue bound to `domain.#` on the topic exchange. */
export function buildDomainCommandsConsumerOptions(
  config: ConfigService,
  domain: string,
): MofiRmqOptions {
  return buildRmqMicroserviceOptions(
    config,
    domainCommandsQueueName(domain),
    {
      wildcards: true,
      exchange: MOFI_DOMAIN_COMMANDS_EXCHANGE,
      exchangeType: 'topic',
      routingKey: domainCommandsBindingKey(domain),
    },
  );
}

