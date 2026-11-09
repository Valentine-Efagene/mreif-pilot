import { Controller, Logger } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import {
  EVENT_DEVELOPER_ASSETS_PURGE,
  type DeveloperAssetsPurgePayload,
} from '../../../../libs/async-jobs/src';
import type { MessageEnvelope } from '../../../../libs/messaging/src/message-envelope';
import { DeveloperAssetsPurgeHandler } from '../async/developer-assets-purge.handler';

type PurgeEnvelope = MessageEnvelope<
  DeveloperAssetsPurgePayload & { jobId: string }
>;

@Controller()
export class DeveloperCommandsController {
  private readonly logger = new Logger(DeveloperCommandsController.name);

  constructor(
    private readonly developerAssetsPurgeHandler: DeveloperAssetsPurgeHandler,
  ) {}

  @EventPattern(EVENT_DEVELOPER_ASSETS_PURGE)
  async onDeveloperAssetsPurge(
    @Payload() envelope: PurgeEnvelope,
    @Ctx() context: RmqContext,
  ): Promise<void> {
    if (!this.developerAssetsPurgeHandler.supports(envelope.eventName)) {
      this.logger.warn(`No handler for ${envelope.eventName}`);
      this.ack(context);
      return;
    }
    await this.developerAssetsPurgeHandler.handle(envelope);
    this.ack(context);
  }

  private ack(context: RmqContext): void {
    const channel = context.getChannelRef();
    const message = context.getMessage();
    channel.ack(message);
  }
}
