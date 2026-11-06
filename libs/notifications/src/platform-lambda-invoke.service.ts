import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';
import { firstValueFrom } from 'rxjs';
import {
  VERIFIER_LAMBDA_CLIENT,
  buildEnvelope,
  isMessagingEnabled,
} from '../../messaging/src';
import type { LambdaInvokeCommand } from '../../messaging/src/message-envelope';

@Injectable()
export class PlatformLambdaInvokeService {
  private readonly logger = new Logger(PlatformLambdaInvokeService.name);
  private readonly lambda = new LambdaClient({});

  constructor(
    private readonly config: ConfigService,
    @Inject(VERIFIER_LAMBDA_CLIENT)
    private readonly verifierClient: ClientProxy,
  ) {}

  get mode(): 'sync' | 'async' {
    const mode = this.config.get<string>('LAMBDA_INVOKE_MODE', 'sync');
    return mode === 'async' ? 'async' : 'sync';
  }

  async invokeFunction(functionArn: string, payload: unknown): Promise<unknown> {
    if (!functionArn) {
      throw new InternalServerErrorException('Lambda ARN not set');
    }

    if (this.mode === 'async' && isMessagingEnabled(this.config)) {
      const envelope = buildEnvelope<LambdaInvokeCommand>(
        'lambda.invoke',
        { functionArn, payload },
      );
      await firstValueFrom(
        this.verifierClient.emit('lambda.invoke', envelope),
      );
      this.logger.debug(`Queued lambda invoke ${envelope.correlationId}`);
      return { queued: true, correlationId: envelope.correlationId };
    }

    const response = await this.lambda.send(
      new InvokeCommand({
        FunctionName: functionArn,
        Payload: Buffer.from(JSON.stringify(payload)),
      }),
    );
    const raw = response.Payload
      ? Buffer.from(response.Payload).toString('utf8')
      : '';
    try {
      return raw ? JSON.parse(raw) : null;
    } catch {
      return raw;
    }
  }
}
