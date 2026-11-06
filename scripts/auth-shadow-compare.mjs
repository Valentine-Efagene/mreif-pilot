#!/usr/bin/env node
/**
 * Compare auth-related HTTP status codes between two API bases (Phase 2 shadow).
 *
 * Usage:
 *   node scripts/auth-shadow-compare.mjs \
 *     --lambda https://api.example.com \
 *     --ecs https://ecs-alb.example.com
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const AUTH_SHADOW_CASES = JSON.parse(
  readFileSync(join(__dirname, '../contract-tests/auth-shadow.json'), 'utf8'),
);

const args = process.argv.slice(2);
function readFlag(name) {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
}

const lambdaBase = readFlag('--lambda') ?? process.env.MOFI_LAMBDA_API_URL;
const ecsBase = readFlag('--ecs') ?? process.env.MOFI_PLATFORM_API_URL;

if (!lambdaBase || !ecsBase) {
  console.error('Provide --lambda and --ecs URLs (or MOFI_LAMBDA_API_URL / MOFI_PLATFORM_API_URL).');
  process.exit(1);
}

let failed = 0;

for (const testCase of AUTH_SHADOW_CASES) {
  const init = {
    method: testCase.method,
    headers: { ...(testCase.headers ?? {}) },
  };
  if (testCase.method !== 'GET' && testCase.method !== 'HEAD') {
    init.headers['Content-Type'] ??= 'application/json';
    init.body = '{}';
  }

  const [lambdaRes, ecsRes] = await Promise.all([
    fetch(`${lambdaBase.replace(/\/$/, '')}${testCase.path}`, init),
    fetch(`${ecsBase.replace(/\/$/, '')}${testCase.path}`, init),
  ]);

  const ok =
    lambdaRes.status === testCase.expectStatus &&
    ecsRes.status === lambdaRes.status;

  console.log(
    `${ok ? 'OK' : 'FAIL'} ${testCase.name}: lambda=${lambdaRes.status} ecs=${ecsRes.status} expected=${testCase.expectStatus}`,
  );
  if (!ok) failed += 1;
}

process.exit(failed > 0 ? 1 : 0);
