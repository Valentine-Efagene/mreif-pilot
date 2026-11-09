import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { buildEnvelope } from '../../messaging/src';
import { DOMAIN_COMMANDS_CLIENT } from '../../messaging/src/messaging.module';

@Injectable()
export class AsyncJobsPublisher {
  private readonly logger = new Logger(AsyncJobsPublisher.name);

  constructor(
    private readonly config: ConfigService,
    @Inject(DOMAIN_COMMANDS_CLIENT)
    private readonly domainCommandsClient: ClientProxy,
  ) {}

  async publish<T>(
    eventName: string,
    jobId: string,
    payload: T,
  ): Promise<void> {
    const envelope = buildEnvelope(eventName, {
      jobId,
      ...payload,
    });

    await firstValueFrom(
      this.domainCommandsClient.emit(eventName, envelope),
    );
    this.logger.log(`Queued ${eventName} jobId=${jobId}`);
  }
}
