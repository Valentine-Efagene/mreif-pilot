import { ConfigService } from '@nestjs/config';
import type { JobsOptions } from 'bullmq';

export const DEFAULT_MOFI_JOB_ATTEMPTS = 5;

export function resolveMofiJobAttempts(config: ConfigService): number {
  const raw = config.get<string>('MOFI_JOB_ATTEMPTS');
  if (raw === undefined || raw === '') {
    return DEFAULT_MOFI_JOB_ATTEMPTS;
  }
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return DEFAULT_MOFI_JOB_ATTEMPTS;
  }
  return parsed;
}

export function buildDefaultJobOptions(config: ConfigService): JobsOptions {
  const attempts = resolveMofiJobAttempts(config);
  return {
    attempts,
    backoff: { type: 'exponential', delay: 1000 },
    removeOnComplete: { count: 500 },
    removeOnFail: { count: 1000 },
  };
}
