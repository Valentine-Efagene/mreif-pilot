import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxy } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';
import {
  NOTIFICATIONS_CLIENT,
  buildEnvelope,
  isMessagingEnabled,
} from '../../messaging/src';
import type { HttpNotificationCommand } from '../../messaging/src/message-envelope';

@Injectable()
export class PlatformNotificationService {
  private readonly logger = new Logger(PlatformNotificationService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly httpService: HttpService,
    @Inject(NOTIFICATIONS_CLIENT) private readonly notificationsClient: ClientProxy,
  ) {}

  get mode(): 'sync' | 'async' {
    const mode = this.config.get<string>('NOTIFICATION_MODE', 'sync');
    return mode === 'async' ? 'async' : 'sync';
  }

  async postNotification(
    url: string,
    body: unknown,
    authorizationHeader?: string,
  ): Promise<unknown> {
    if (this.mode === 'async' && isMessagingEnabled(this.config)) {
      const envelope = buildEnvelope<HttpNotificationCommand>(
        'http.notification',
        { url, body },
        authorizationHeader
          ? { authorizationHeader }
          : undefined,
      );
      await firstValueFrom(
        this.notificationsClient.emit('http.notification', envelope),
      );
      this.logger.debug(`Queued notification ${envelope.correlationId} → ${url}`);
      return { queued: true, correlationId: envelope.correlationId };
    }

    if (!url) {
      throw new InternalServerErrorException('Notification URL not set');
    }

    const headers: Record<string, string> = {};
    if (authorizationHeader) {
      headers.Authorization = authorizationHeader;
    }

    const { data } = await firstValueFrom(
      this.httpService.post(url, body, { headers }).pipe(
        catchError((error: AxiosError) => {
          throw error;
        }),
      ),
    );
    return data;
  }
}
