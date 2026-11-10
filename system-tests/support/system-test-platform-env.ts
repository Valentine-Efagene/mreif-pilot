import { applyAmqpTestEnv } from './messaging-test-env';

/** Kind `mofi-test` namespace: host ports from infra/k8s/kind/cluster.yaml + values-test.yaml */
export function applyK8sSystemTestEnv(): void {
  process.env.MOFI_PLATFORM_API_URL =
    process.env.MOFI_PLATFORM_API_URL ?? 'http://localhost:18082';
  process.env.SYSTEM_TEST_K8S_NAMESPACE =
    process.env.SYSTEM_TEST_K8S_NAMESPACE ?? 'mofi-test';

  process.env.SYSTEM_TEST_DB_HOST = process.env.SYSTEM_TEST_DB_HOST ?? '127.0.0.1';
  process.env.SYSTEM_TEST_DB_PORT = process.env.SYSTEM_TEST_DB_PORT ?? '13308';
  process.env.SYSTEM_TEST_DB_NAME =
    process.env.SYSTEM_TEST_DB_NAME ?? 'mofi_platform_test';
  process.env.SYSTEM_TEST_DB_USERNAME =
    process.env.SYSTEM_TEST_DB_USERNAME ?? 'root';
  process.env.SYSTEM_TEST_DB_PASSWORD =
    process.env.SYSTEM_TEST_DB_PASSWORD ?? 'mofi_test_root';

  applyAmqpTestEnv();
  process.env.REDIS_PORT = process.env.REDIS_PORT ?? '16380';

  process.env.AUTH_ENFORCEMENT = 'gateway';
  process.env.admin_dashboard_url =
    process.env.admin_dashboard_url ?? 'https://admin.stub.mofi';
}

export async function waitForPlatformHealth(
  baseUrl: string,
  deadlineMs = 180_000,
): Promise<void> {
  const root = baseUrl.replace(/\/$/, '');
  const paths = ['/health', '/developer/health'];
  const deadline = Date.now() + deadlineMs;

  while (Date.now() < deadline) {
    let ok = true;
    for (const path of paths) {
      try {
        const res = await fetch(`${root}${path}`);
        if (!res.ok) {
          ok = false;
          break;
        }
      } catch {
        ok = false;
        break;
      }
    }
    if (ok) {
      return;
    }
    await new Promise((r) => setTimeout(r, 2000));
  }

  throw new Error(
    `Timed out waiting for platform health at ${root} (${paths.join(', ')}) — run npm run k8s:test:setup`,
  );
}
