import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';
import {
  buildDefaultJobOptions,
  buildEnvelope,
} from '../../messaging/src';
import type { HttpNotificationCommand } from '../../messaging/src/message-envelope';
import { MOFI_NOTIFICATIONS_QUEUE } from '../../messaging/src/message-envelope';

@Injectable()
export class PlatformNotificationService {
  private readonly logger = new Logger(PlatformNotificationService.name);

  constructor(
    private readonly config: ConfigService,
    @InjectQueue(MOFI_NOTIFICATIONS_QUEUE)
    private readonly notificationsQueue: Queue,
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
    await this.notificationsQueue.add(
      'http.notification',
      envelope,
      buildDefaultJobOptions(this.config),
    );
    this.logger.debug(`Queued notification ${envelope.correlationId} → ${url}`);
    return { queued: true, correlationId: envelope.correlationId };
  }
}
