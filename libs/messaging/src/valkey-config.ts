import { ConfigService } from '@nestjs/config';
import type { RedisOptions } from 'ioredis';

/** BullMQ key prefix; agent cache should use another prefix (e.g. mofi:agent:). */
export const MOFI_BULL_KEY_PREFIX = 'mofi:bull:';

export function getValkeyUrl(config: ConfigService): string {
  const url = config.get<string>('VALKEY_URL');
  if (url) {
    return url;
  }
  const host = config.get<string>('REDIS_HOST', '127.0.0.1');
  const port = config.get<string>('REDIS_PORT', '6379');
  const password = config.get<string>('REDIS_PASSWORD');
  const user = config.get<string>('VALKEY_USERNAME');
  if (password) {
    const auth = user ? `${encodeURIComponent(user)}:${encodeURIComponent(password)}` : `:${encodeURIComponent(password)}`;
    return `redis://${auth}@${host}:${port}`;
  }
  return `redis://${host}:${port}`;
}

export function getValkeyConnectionOptions(
  config: ConfigService,
): RedisOptions {
  const url = getValkeyUrl(config);
  const useTls =
    url.startsWith('rediss://') || config.get<string>('REDIS_TLS') === 'true';
  return {
    maxRetriesPerRequest: null,
    ...parseRedisUrlToOptions(url, useTls),
  };
}

function parseRedisUrlToOptions(url: string, useTls: boolean): RedisOptions {
  try {
    const parsed = new URL(url.replace(/^redis:\/\//, 'http://').replace(/^rediss:\/\//, 'https://'));
    const db =
      parsed.pathname && parsed.pathname.length > 1
        ? Number.parseInt(parsed.pathname.slice(1), 10)
        : undefined;
    return {
      host: parsed.hostname,
      port: parsed.port ? Number.parseInt(parsed.port, 10) : 6379,
      password: parsed.password || undefined,
      username: parsed.username || undefined,
      db: Number.isFinite(db) ? db : undefined,
      tls: useTls ? {} : undefined,
    };
  } catch {
    return { host: '127.0.0.1', port: 6379, tls: useTls ? {} : undefined };
  }
}
