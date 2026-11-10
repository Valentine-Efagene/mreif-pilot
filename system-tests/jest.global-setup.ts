import { waitForTcp } from './support/wait-for-tcp';
import {
  applyK8sSystemTestEnv,
  waitForPlatformHealth,
} from './support/system-test-platform-env';

export default async function globalSetup(): Promise<void> {
  if (process.env.SYSTEM_TESTS_ENABLED !== 'true') {
    return;
  }

  applyK8sSystemTestEnv();

  const dbHost = process.env.SYSTEM_TEST_DB_HOST ?? '127.0.0.1';
  const dbPort = Number(process.env.SYSTEM_TEST_DB_PORT ?? 3308);

  await waitForTcp(dbHost, dbPort);

  const redisHost = process.env.REDIS_HOST ?? '127.0.0.1';
  const redisPort = Number(process.env.REDIS_PORT ?? 16380);
  await waitForTcp(redisHost, redisPort);

  const apiBase = process.env.MOFI_PLATFORM_API_URL!;
  await waitForPlatformHealth(apiBase);
}
