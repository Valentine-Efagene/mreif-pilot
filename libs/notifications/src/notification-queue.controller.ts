import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import type {
  HttpNotificationCommand,
  MessageEnvelope,
} from '../../messaging/src/message-envelope';

@Controller()
export class NotificationQueueController {
  private readonly logger = new Logger(NotificationQueueController.name);

  constructor(private readonly httpService: HttpService) {}

  @EventPattern('http.notification')
  async handleHttpNotification(
    @Payload() envelope: MessageEnvelope<HttpNotificationCommand>,
  ): Promise<void> {
    const { url, body } = envelope.payload;
    const headers: Record<string, string> = {};
    if (envelope.authContext?.authorizationHeader) {
      headers.Authorization = envelope.authContext.authorizationHeader;
    }

    this.logger.log(
      `Delivering notification ${envelope.correlationId} → ${url}`,
    );

    await firstValueFrom(
      this.httpService.post(url, body, { headers }).pipe(
        catchError((error: AxiosError) => {
          this.logger.error(
            `Notification delivery failed ${envelope.correlationId}: ${error.message}`,
          );
          throw error;
        }),
      ),
    );
  }
}
