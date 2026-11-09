import type { Server } from 'http';

// supertest default import is unreliable under ts-jest; require keeps tests green.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const supertest = require('supertest') as (
  app: Server,
) => ReturnType<typeof import('supertest')>;

export function httpTestClient(app: Server) {
  return supertest(app);
}
