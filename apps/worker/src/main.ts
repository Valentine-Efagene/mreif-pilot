import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { WorkerAppModule } from './worker-app.module';
import { connectMofiMicroservices } from '../../_shared/connect-microservices';
import { normalizeMofiEnv } from '../../../libs/database/src/normalize-env';

async function bootstrap() {
  normalizeMofiEnv();
  process.env.MOFI_RUNTIME ??= 'worker';
  process.env.MOFI_WORKER_QUEUES ??= 'all';

  const logger = new Logger('Worker');
  const app = await NestFactory.create(WorkerAppModule, {
    logger: ['error', 'warn', 'log'],
  });

  const config = app.get(ConfigService);
  await connectMofiMicroservices(app, config);

  const port = config.get<number>('PORT') ?? 3007;
  await app.listen(port);
  logger.log(`Worker listening on ${port}`);
}

bootstrap();
