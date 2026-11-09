import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import type { MessageEnvelope } from '../../../libs/messaging/src/message-envelope';
import { DeveloperAssetsPurgeHandler } from '../../../domains/developer/src/async/developer-assets-purge.handler';

@Controller()
export class DomainCommandsQueueController {
  private readonly logger = new Logger(DomainCommandsQueueController.name);

  constructor(
    private readonly developerPurgeHandler: DeveloperAssetsPurgeHandler,
  ) {}

  @EventPattern('developer.assets.purge')
  async onDeveloperAssetsPurge(
    @Payload() envelope: MessageEnvelope<{ jobId: string; developerId: number }>,
  ): Promise<void> {
    if (!this.developerPurgeHandler.supports(envelope.eventName)) {
      this.logger.warn(`No handler for ${envelope.eventName}`);
      return;
    }
    await this.developerPurgeHandler.handle(envelope);
  }
}
