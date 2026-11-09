import { ConfigService } from '@nestjs/config';

export type MofiRmqOptions = {
  urls: string[];
  queue: string;
  queueOptions?: { durable?: boolean };
  noAck?: boolean;
  prefetchCount?: number;
  isGlobalPrefetchCount?: boolean;
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

export function buildRmqMicroserviceOptions(
  config: ConfigService,
  queue: string,
): MofiRmqOptions {
  return {
    urls: getAmqpUrls(config),
    queue,
    queueOptions: { durable: true },
    noAck: false,
    prefetchCount: 1,
    isGlobalPrefetchCount: true,
  };
}

export function isMessagingEnabled(config: ConfigService): boolean {
  return config.get<string>('MESSAGING_ENABLED', 'false') === 'true';
}
