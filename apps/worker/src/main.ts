import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { WorkerAppModule } from './worker-app.module';
import { normalizeMofiEnv } from '../../../libs/database/src/normalize-env';

async function bootstrap() {
  normalizeMofiEnv();
  process.env.MOFI_RUNTIME ??= 'worker';
  process.env.MOFI_WORKER_QUEUES ??= 'all';

  const logger = new Logger('Worker');
  const app = await NestFactory.create(WorkerAppModule, {
    logger: ['error', 'warn', 'log'],
  });

  const port = process.env.PORT ? Number(process.env.PORT) : 3007;
  await app.listen(port);
  logger.log(`Worker listening on ${port}`);
}

bootstrap();
