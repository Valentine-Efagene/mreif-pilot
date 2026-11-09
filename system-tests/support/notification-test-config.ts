export const DEFAULT_REAL_NOTIFICATION_URL =
  'https://api.qshelter.ng/testnotify/email';

export const DEFAULT_SYSTEM_TEST_EMAIL = 'efagenevalentine@gmail.com';

export type NotificationTarget = 'shim' | 'real';

export function resolveNotificationTarget(): NotificationTarget {
  return process.env.SYSTEM_TEST_NOTIFICATION_TARGET === 'real'
    ? 'real'
    : 'shim';
}

export function assertRealNotificationsAllowed(): void {
  if (
    resolveNotificationTarget() === 'real' &&
    process.env.SYSTEM_TEST_ALLOW_REAL_NOTIFICATIONS !== 'true'
  ) {
    throw new Error(
      'SYSTEM_TEST_NOTIFICATION_TARGET=real requires SYSTEM_TEST_ALLOW_REAL_NOTIFICATIONS=true',
    );
  }
}

export function resolveRealNotificationBaseUrl(): string {
  return (
    process.env.NOTIFICATION_URL ??
    process.env.notification_url ??
    DEFAULT_REAL_NOTIFICATION_URL
  ).replace(/\/$/, '');
}

export function systemTestDeveloperEmail(): string {
  return (
    process.env.SYSTEM_TEST_DEVELOPER_EMAIL ?? DEFAULT_SYSTEM_TEST_EMAIL
  );
}

export function systemTestProjectManagerEmail(): string {
  return process.env.SYSTEM_TEST_PM_EMAIL ?? DEFAULT_SYSTEM_TEST_EMAIL;
}
