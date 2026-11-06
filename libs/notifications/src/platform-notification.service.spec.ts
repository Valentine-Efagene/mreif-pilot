import { PlatformNotificationService } from './platform-notification.service';

describe('PlatformNotificationService', () => {
  it('defaults to sync mode', () => {
    const config = {
      get: (key: string, def?: string) =>
        key === 'NOTIFICATION_MODE' ? def : def,
    } as any;
    const http = {} as any;
    const client = { emit: jest.fn() } as any;
    const svc = new PlatformNotificationService(config, http, client);
    expect(svc.mode).toBe('sync');
  });
});
