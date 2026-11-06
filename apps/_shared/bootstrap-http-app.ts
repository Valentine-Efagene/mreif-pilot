import { INestApplication, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { normalizeMofiEnv } from '../../libs/database/src/normalize-env';
import { connectMofiMicroservices } from './connect-microservices';

export type BootstrapHttpOptions = {
  globalPrefix?: string;
  enableSwagger?: boolean;
};

export async function bootstrapHttpApp(
  module: Parameters<typeof NestFactory.create>[0],
  options: BootstrapHttpOptions = {},
): Promise<INestApplication> {
  normalizeMofiEnv();
  const app = await NestFactory.create(module, {
    logger: ['error', 'warn', 'log'],
  });

  app.enableCors({
    origin: true,
    allowedHeaders: '*',
    methods: '*',
  });

  if (options.globalPrefix) {
    app.setGlobalPrefix(options.globalPrefix);
  }

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: false,
      transform: true,
    }),
  );

  const config = app.get(ConfigService);
  await connectMofiMicroservices(app, config);

  const port = config.get<number>('PORT') ?? 8080;
  await app.listen(port);
  return app;
}
