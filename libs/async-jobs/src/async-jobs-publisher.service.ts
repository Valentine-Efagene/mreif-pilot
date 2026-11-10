import { getQueueToken } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ModuleRef } from '@nestjs/core';
import { Queue } from 'bullmq';
import {
  buildDefaultJobOptions,
  buildEnvelope,
  queueForDomainEvent,
} from '../../messaging/src';

@Injectable()
export class AsyncJobsPublisher {
  private readonly logger = new Logger(AsyncJobsPublisher.name);

  constructor(
    private readonly config: ConfigService,
    private readonly moduleRef: ModuleRef,
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

    const queueName = queueForDomainEvent(eventName);
    const queue = this.moduleRef.get<Queue>(getQueueToken(queueName), {
      strict: false,
    });
    if (!queue) {
      throw new Error(`Bull queue not registered: ${queueName}`);
    }

    await queue.add(eventName, envelope, buildDefaultJobOptions(this.config));
    this.logger.log(`Queued ${eventName} jobId=${jobId}`);
  }
}
