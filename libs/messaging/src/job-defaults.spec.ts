import { ConfigService } from '@nestjs/config';
import {
  buildDefaultJobOptions,
  DEFAULT_MOFI_JOB_ATTEMPTS,
  resolveMofiJobAttempts,
} from './job-defaults';

describe('job-defaults', () => {
  it('uses default attempts', () => {
    const config = new ConfigService({});
    expect(resolveMofiJobAttempts(config)).toBe(DEFAULT_MOFI_JOB_ATTEMPTS);
  });

  it('reads MOFI_JOB_ATTEMPTS', () => {
    const config = new ConfigService({ MOFI_JOB_ATTEMPTS: '10' });
    expect(resolveMofiJobAttempts(config)).toBe(10);
  });

  it('falls back on invalid attempts', () => {
    const config = new ConfigService({ MOFI_JOB_ATTEMPTS: 'nope' });
    expect(resolveMofiJobAttempts(config)).toBe(DEFAULT_MOFI_JOB_ATTEMPTS);
  });

  it('builds exponential backoff job options', () => {
    const config = new ConfigService({});
    const opts = buildDefaultJobOptions(config);
    expect(opts.attempts).toBe(5);
    expect(opts.backoff).toEqual({ type: 'exponential', delay: 1000 });
  });
});
