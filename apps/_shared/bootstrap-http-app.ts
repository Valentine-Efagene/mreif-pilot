import { INestApplication, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { normalizeMofiEnv } from '../../libs/database/src/normalize-env';
import { connectMofiMicroservices } from './connect-microservices';

export type BootstrapHttpOptions = {
  globalPrefix?: string;
  enableSwagger?: boolean;
  swaggerTitle?: string;
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

  const swaggerEnabled =
    options.enableSwagger ??
    process.env.SWAGGER_ENABLED !== 'false';
  if (swaggerEnabled) {
    const domainLabel = options.globalPrefix ?? 'platform';
    const title =
      options.swaggerTitle ?? `MOFI ${domainLabel} API`;
    const config = new DocumentBuilder()
      .setTitle(title)
      .setDescription(`MOFI Platform API — ${domainLabel} domain`)
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document, {
      swaggerOptions: { persistAuthorization: true },
    });
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
