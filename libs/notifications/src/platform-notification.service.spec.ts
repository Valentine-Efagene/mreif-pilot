import { of } from 'rxjs';
import { PlatformNotificationService } from './platform-notification.service';

describe('PlatformNotificationService', () => {
  it('queues http.notification on the RMQ client', async () => {
    const client = { emit: jest.fn(() => of(undefined)) } as any;
    const svc = new PlatformNotificationService(client);

    const result = await svc.postNotification(
      'https://notifications.example/hook',
      { hello: 'world' },
    );

    expect(client.emit).toHaveBeenCalledWith(
      'http.notification',
      expect.objectContaining({
        eventName: 'http.notification',
        payload: {
          url: 'https://notifications.example/hook',
          body: { hello: 'world' },
        },
      }),
    );
    expect(result).toEqual(
      expect.objectContaining({ queued: true, correlationId: expect.any(String) }),
    );
  });
});
