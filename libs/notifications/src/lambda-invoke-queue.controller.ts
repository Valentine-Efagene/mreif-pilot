import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';
import type {
  LambdaInvokeCommand,
  MessageEnvelope,
} from '../../messaging/src/message-envelope';

@Controller()
export class LambdaInvokeQueueController {
  private readonly logger = new Logger(LambdaInvokeQueueController.name);
  private readonly lambda = new LambdaClient({});

  @EventPattern('lambda.invoke')
  async handleLambdaInvoke(
    @Payload() envelope: MessageEnvelope<LambdaInvokeCommand>,
  ): Promise<void> {
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
