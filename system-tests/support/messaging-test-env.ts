/** Defaults for `infra/local/test` RabbitMQ (host port 5673). */
export function applyAmqpTestEnv(): void {
  process.env.AMQP_HOST = process.env.AMQP_HOST ?? '127.0.0.1';
  process.env.AMQP_PORT = process.env.AMQP_PORT ?? '5673';
  process.env.AMQP_USERNAME = process.env.AMQP_USERNAME ?? 'mofi';
  process.env.AMQP_PASSWORD = process.env.AMQP_PASSWORD ?? 'mofi';
  process.env.AMQP_VHOST = process.env.AMQP_VHOST ?? 'mofi';
  // Test Rabbit image may not support x-delivery-limit on classic queues; DLQ still applies.
  process.env.MOFI_RMQ_DELIVERY_LIMIT =
    process.env.MOFI_RMQ_DELIVERY_LIMIT ?? '0';
}

export function rabbitMgmtBaseUrl(): string {
  const host = process.env.AMQP_HOST ?? '127.0.0.1';
  const port = process.env.SYSTEM_TEST_RABBIT_MGMT_PORT ?? '15673';
  return `http://${host}:${port}`;
}

export function rabbitManagementAuthHeader(): string {
  const user = process.env.AMQP_USERNAME ?? 'mofi';
  const pass = process.env.AMQP_PASSWORD ?? 'mofi';
  return `Basic ${Buffer.from(`${user}:${pass}`).toString('base64')}`;
}
