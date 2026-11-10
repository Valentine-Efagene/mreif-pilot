import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';
import { PlatformNotificationService } from './platform-notification.service';

describe('PlatformNotificationService', () => {
  it('queues http.notification on the Bull queue', async () => {
    const queue = { add: jest.fn(async () => undefined) } as unknown as Queue;
    const config = new ConfigService({});
    const svc = new PlatformNotificationService(config, queue);

    const result = await svc.postNotification(
      'https://notifications.example/hook',
      { hello: 'world' },
    );

    expect(queue.add).toHaveBeenCalledWith(
      'http.notification',
      expect.objectContaining({
        eventName: 'http.notification',
        payload: {
          url: 'https://notifications.example/hook',
          body: { hello: 'world' },
        },
      }),
      expect.objectContaining({ attempts: expect.any(Number) }),
    );
    expect(result).toEqual(
      expect.objectContaining({ queued: true, correlationId: expect.any(String) }),
    );
  });
});
