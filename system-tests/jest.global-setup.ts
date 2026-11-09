import { waitForTcp } from './support/wait-for-tcp';
import { applyAmqpTestEnv } from './support/messaging-test-env';
import { assertRealNotificationsAllowed } from './support/notification-test-config';

export default async function globalSetup(): Promise<void> {
  if (process.env.SYSTEM_TESTS_ENABLED !== 'true') {
    return;
  }

  process.env.AUTH_ENFORCEMENT = 'gateway';
  process.env.admin_dashboard_url = 'https://admin.stub.mofi';
  applyAmqpTestEnv();
  assertRealNotificationsAllowed();

  const dbHost = process.env.SYSTEM_TEST_DB_HOST ?? '127.0.0.1';
  const dbPort = Number(process.env.SYSTEM_TEST_DB_PORT ?? 3308);

  await waitForTcp(dbHost, dbPort);

  const amqpHost = process.env.AMQP_HOST ?? '127.0.0.1';
  const amqpPort = Number(process.env.AMQP_PORT ?? 5673);
  await waitForTcp(amqpHost, amqpPort);

  const mgmtPort = Number(process.env.SYSTEM_TEST_RABBIT_MGMT_PORT ?? 15673);
  const mgmtUser = process.env.AMQP_USERNAME ?? 'mofi';
  const mgmtPass = process.env.AMQP_PASSWORD ?? 'mofi';
  const auth = Buffer.from(`${mgmtUser}:${mgmtPass}`).toString('base64');
  const mgmtDeadline = Date.now() + 120_000;
  let rabbitReady = false;
  while (Date.now() < mgmtDeadline) {
    try {
      const res = await fetch(`http://${amqpHost}:${mgmtPort}/api/overview`, {
        headers: { Authorization: `Basic ${auth}` },
      });
      if (res.ok) {
        rabbitReady = true;
        break;
      }
    } catch {
      // Rabbit management not up yet
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  if (!rabbitReady) {
    throw new Error(
      `Timed out waiting for RabbitMQ management API on ${amqpHost}:${mgmtPort}`,
    );
  }

  if (process.env.SYSTEM_TEST_MAILPIT === 'true') {
    const mailpitPort = Number(process.env.SYSTEM_TEST_MAILPIT_PORT ?? 8025);
    await waitForTcp('127.0.0.1', mailpitPort);
  }
}
