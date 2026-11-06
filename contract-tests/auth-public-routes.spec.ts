import { AUTHORIZER_PUBLIC_PATHS } from '../libs/auth/src/authorizer-public-routes';
import { AUTH_SHADOW_CASES } from './auth-shadow';

describe('Authorizer public routes (shared contract)', () => {
  it('lists paths used for local AUTH_ENFORCEMENT=local guard', () => {
    expect(AUTHORIZER_PUBLIC_PATHS).toContain('/health');
    expect(AUTHORIZER_PUBLIC_PATHS).toContain('/cooperative/cooperatives/names');
  });

  it('aligns shadow public cases with authorizer public paths', () => {
    const publicShadow = AUTH_SHADOW_CASES.filter((c) => c.expectStatus === 200);
    for (const testCase of publicShadow) {
      const allowed = AUTHORIZER_PUBLIC_PATHS.some(
        (p) => testCase.path === p || testCase.path.startsWith(`${p}/`),
      );
      expect(allowed).toBe(true);
    }
  });
});
