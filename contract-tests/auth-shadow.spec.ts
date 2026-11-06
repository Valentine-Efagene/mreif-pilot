import { AUTH_SHADOW_CASES } from './auth-shadow';

describe('Auth shadow contract cases', () => {
  it('defines parity scenarios for Phase 2', () => {
    expect(AUTH_SHADOW_CASES.length).toBeGreaterThanOrEqual(5);
    const names = AUTH_SHADOW_CASES.map((c) => c.name);
    expect(new Set(names).size).toBe(names.length);
  });
});

describe('Auth shadow HTTP parity (optional integration)', () => {
  const lambdaBase = process.env.MOFI_LAMBDA_API_URL;
  const ecsBase = process.env.MOFI_PLATFORM_API_URL;

  const runParity = lambdaBase && ecsBase ? it : it.skip;

  runParity('Lambda vs ECS auth outcomes match', async () => {
    for (const testCase of AUTH_SHADOW_CASES) {
      const init: RequestInit = {
        method: testCase.method,
        headers: testCase.headers ?? {},
      };
      if (testCase.method !== 'GET' && testCase.method !== 'HEAD') {
        init.body = JSON.stringify({});
      }

      const [lambdaRes, ecsRes] = await Promise.all([
        fetch(`${lambdaBase}${testCase.path}`, init),
        fetch(`${ecsBase}${testCase.path}`, init),
      ]);

      expect(lambdaRes.status).toBe(testCase.expectStatus);
      expect(ecsRes.status).toBe(lambdaRes.status);
    }
  });
});
