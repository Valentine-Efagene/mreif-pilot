import { DOMAIN_ROUTE_CONTRACT, DOMAIN_BASE_PATHS } from './domain-routes';

describe('MOFI domain route contract', () => {
  it('lists all six gateway base paths', () => {
    expect(DOMAIN_BASE_PATHS).toEqual([
      'agent',
      'pmb',
      'rsa',
      'developer',
      'uploader',
      'cooperative',
    ]);
  });

  it('includes admin RSA legacy approval paths', () => {
    const legacy = DOMAIN_ROUTE_CONTRACT.filter((r) => r.path.startsWith('/rsa/api/'));
    expect(legacy).toHaveLength(4);
  });

  it('includes uploader presign flows used by admin', () => {
    const uploader = DOMAIN_ROUTE_CONTRACT.filter((r) => r.path.startsWith('/uploader/'));
    expect(uploader.length).toBeGreaterThanOrEqual(4);
  });
});

describe('MOFI platform HTTP surface (optional integration)', () => {
  const baseUrl = process.env.MOFI_PLATFORM_API_URL;

  (baseUrl ? it : it.skip)('health endpoint responds', async () => {
    const res = await fetch(`${baseUrl}/health`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe('healthy');
  });
});
