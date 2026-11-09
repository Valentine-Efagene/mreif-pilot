export const DEFAULT_NOTIFICATION_URL =
  'https://api.qshelter.ng/testnotify/email';

export const DEFAULT_SYSTEM_TEST_EMAIL = 'efagenevalentine@gmail.com';

export function resolveNotificationBaseUrl(): string {
  return (
    process.env.NOTIFICATION_URL ??
    process.env.notification_url ??
    DEFAULT_NOTIFICATION_URL
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
