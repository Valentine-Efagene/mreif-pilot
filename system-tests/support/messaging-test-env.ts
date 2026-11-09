/** Defaults for `infra/local/test` RabbitMQ (host port 5673). */
export function applyAmqpTestEnv(): void {
  process.env.AMQP_HOST = process.env.AMQP_HOST ?? '127.0.0.1';
  process.env.AMQP_PORT = process.env.AMQP_PORT ?? '5673';
  process.env.AMQP_USERNAME = process.env.AMQP_USERNAME ?? 'mofi';
  process.env.AMQP_PASSWORD = process.env.AMQP_PASSWORD ?? 'mofi';
  process.env.AMQP_VHOST = process.env.AMQP_VHOST ?? 'mofi';
}

export async function waitForShimPath(
  calls: Array<{ path: string }>,
  pathFragment: string,
  timeoutMs = 30_000,
): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (calls.some((c) => c.path.includes(pathFragment))) {
      return;
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error(
    `Timed out waiting for notification HTTP call containing "${pathFragment}"`,
  );
}
