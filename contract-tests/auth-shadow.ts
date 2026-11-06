export type AuthShadowCase = {
  name: string;
  method: string;
  path: string;
  headers?: Record<string, string>;
  expectStatus: number;
};

/** Public 200 cases must match libs/auth/src/authorizer-public-routes.ts (authorizer owns prod). */

// eslint-disable-next-line @typescript-eslint/no-require-imports
export const AUTH_SHADOW_CASES = require('./auth-shadow.json') as AuthShadowCase[];
