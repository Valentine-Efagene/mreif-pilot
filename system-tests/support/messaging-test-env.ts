/** Defaults for kind `mofi-test` Valkey (host Redis nodePort, e.g. 30637). */
export function applyValkeyTestEnv(): void {
  process.env.REDIS_HOST = process.env.REDIS_HOST ?? '127.0.0.1';
  process.env.REDIS_PORT = process.env.REDIS_PORT ?? '30637';
  process.env.MOFI_JOB_ATTEMPTS = process.env.MOFI_JOB_ATTEMPTS ?? '3';
}

/** @deprecated Use {@link applyValkeyTestEnv}. */
export function applyAmqpTestEnv(): void {
  applyValkeyTestEnv();
}
