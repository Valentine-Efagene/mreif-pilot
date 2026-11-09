import { Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { NOTIFICATIONS_CLIENT, buildEnvelope } from '../../messaging/src';
import type { HttpNotificationCommand } from '../../messaging/src/message-envelope';

@Injectable()
export class PlatformNotificationService {
  private readonly logger = new Logger(PlatformNotificationService.name);

  constructor(
    @Inject(NOTIFICATIONS_CLIENT) private readonly notificationsClient: ClientProxy,
  ) {}

  async postNotification(
    url: string,
    body: unknown,
    authorizationHeader?: string,
  ): Promise<unknown> {
    const envelope = buildEnvelope<HttpNotificationCommand>(
      'http.notification',
      { url, body },
      authorizationHeader ? { authorizationHeader } : undefined,
    );
    await firstValueFrom(
      this.notificationsClient.emit('http.notification', envelope),
    );
    this.logger.debug(`Queued notification ${envelope.correlationId} → ${url}`);
    return { queued: true, correlationId: envelope.correlationId };
  }
}
