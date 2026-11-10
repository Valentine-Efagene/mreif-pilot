import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { type DeveloperAssetsPurgePayload } from '../../../../libs/async-jobs/src';
import { domainCommandsQueueName } from '../../../../libs/messaging/src/domain-commands';
import type { MessageEnvelope } from '../../../../libs/messaging/src/message-envelope';
import { DeveloperAssetsPurgeHandler } from '../async/developer-assets-purge.handler';

type PurgeEnvelope = MessageEnvelope<
  DeveloperAssetsPurgePayload & { jobId: string }
>;

@Processor(domainCommandsQueueName('developer'))
export class DeveloperCommandsProcessor extends WorkerHost {
  private readonly logger = new Logger(DeveloperCommandsProcessor.name);

  constructor(
    private readonly developerAssetsPurgeHandler: DeveloperAssetsPurgeHandler,
  ) {
    super();
  }

  async process(job: Job<PurgeEnvelope>): Promise<void> {
    const envelope = job.data;
    if (!this.developerAssetsPurgeHandler.supports(envelope.eventName)) {
      this.logger.warn(`No handler for ${envelope.eventName}`);
      return;
    }
    await this.developerAssetsPurgeHandler.handle(envelope);
  }
}
