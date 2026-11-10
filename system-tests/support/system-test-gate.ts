export function isSystemTestsEnabled(): boolean {
  return (
    process.env.SYSTEM_TESTS_ENABLED === 'true' ||
    Boolean(process.env.MOFI_PLATFORM_API_URL)
  );
}

export type SystemTestMode = 'http' | 'in-process';

export function resolveSystemTestMode(): SystemTestMode | null {
  if (!isSystemTestsEnabled()) {
    return null;
  }
  if (process.env.SYSTEM_TEST_IN_PROCESS === 'true') {
    return 'in-process';
  }
  if (process.env.MOFI_PLATFORM_API_URL || process.env.SYSTEM_TESTS_ENABLED === 'true') {
    return 'http';
  }
  return null;
}
