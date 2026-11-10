import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';
import type {
  LambdaInvokeCommand,
  MessageEnvelope,
} from '../../messaging/src/message-envelope';
import { MOFI_VERIFIER_LAMBDA_QUEUE } from '../../messaging/src/message-envelope';

@Processor(MOFI_VERIFIER_LAMBDA_QUEUE)
export class LambdaInvokeQueueProcessor extends WorkerHost {
  private readonly logger = new Logger(LambdaInvokeQueueProcessor.name);
  private readonly lambda = new LambdaClient({});

  async process(job: Job<MessageEnvelope<LambdaInvokeCommand>>): Promise<void> {
    const envelope = job.data;
    const { functionArn, payload } = envelope.payload;
    this.logger.log(
      `Invoking lambda ${functionArn} (${envelope.correlationId})`,
    );

    await this.lambda.send(
      new InvokeCommand({
        FunctionName: functionArn,
        Payload: Buffer.from(JSON.stringify(payload)),
      }),
    );
  }
}
