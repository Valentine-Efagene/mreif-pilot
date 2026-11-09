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
  if (process.env.MOFI_PLATFORM_API_URL) {
    return 'http';
  }
  if (process.env.SYSTEM_TESTS_ENABLED === 'true') {
    return 'in-process';
  }
  return null;
}
