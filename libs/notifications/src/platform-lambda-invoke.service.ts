import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { VERIFIER_LAMBDA_CLIENT, buildEnvelope } from '../../messaging/src';
import type { LambdaInvokeCommand } from '../../messaging/src/message-envelope';

@Injectable()
export class PlatformLambdaInvokeService {
  private readonly logger = new Logger(PlatformLambdaInvokeService.name);

  constructor(
    @Inject(VERIFIER_LAMBDA_CLIENT)
    private readonly verifierClient: ClientProxy,
  ) {}

  async invokeFunction(functionArn: string, payload: unknown): Promise<unknown> {
    if (!functionArn) {
      throw new InternalServerErrorException('Lambda ARN not set');
    }

    const envelope = buildEnvelope<LambdaInvokeCommand>(
      'lambda.invoke',
      { functionArn, payload },
    );
    await firstValueFrom(this.verifierClient.emit('lambda.invoke', envelope));
    this.logger.debug(`Queued lambda invoke ${envelope.correlationId}`);
    return { queued: true, correlationId: envelope.correlationId };
  }
}
