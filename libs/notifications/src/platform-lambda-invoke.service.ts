import { InjectQueue } from '@nestjs/bullmq';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';
import {
  buildDefaultJobOptions,
  buildEnvelope,
} from '../../messaging/src';
import type { LambdaInvokeCommand } from '../../messaging/src/message-envelope';
import { MOFI_VERIFIER_LAMBDA_QUEUE } from '../../messaging/src/message-envelope';

@Injectable()
export class PlatformLambdaInvokeService {
  private readonly logger = new Logger(PlatformLambdaInvokeService.name);

  constructor(
    private readonly config: ConfigService,
    @InjectQueue(MOFI_VERIFIER_LAMBDA_QUEUE)
    private readonly verifierQueue: Queue,
  ) {}

  async invokeFunction(functionArn: string, payload: unknown): Promise<unknown> {
    if (!functionArn) {
      throw new InternalServerErrorException('Lambda ARN not set');
    }

    const envelope = buildEnvelope<LambdaInvokeCommand>('lambda.invoke', {
      functionArn,
      payload,
    });
    await this.verifierQueue.add(
      'lambda.invoke',
      envelope,
      buildDefaultJobOptions(this.config),
    );
    this.logger.debug(`Queued lambda invoke ${envelope.correlationId}`);
    return { queued: true, correlationId: envelope.correlationId };
  }
}
