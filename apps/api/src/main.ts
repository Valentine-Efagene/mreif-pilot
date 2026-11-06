import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { QueryFailedFilter } from '../../../domains/pmb/src/common/common.error';
import { AccessLoggerMiddleware } from '../../../domains/pmb/src/common/middleware/AccessLoggerMiddleware';
import { connectMofiMicroservices } from '../../_shared/connect-microservices';
import { normalizeMofiEnv } from '../../../libs/database/src/normalize-env';

async function bootstrap() {
  normalizeMofiEnv();
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  const configService = app.get(ConfigService);
  await connectMofiMicroservices(app, configService);

  app.enableCors({
    origin: true,
    allowedHeaders: '*',
    methods: '*',
  });

  app.use(new AccessLoggerMiddleware().use);
  app.useGlobalFilters(new QueryFailedFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: false,
      transform: true,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('MOFI Platform API (ECS)')
    .setDescription('Unified pilot API — path prefixes mirror API Gateway base paths')
    .setVersion('1.0')
    .addBearerAuth()
    .addServer('/agent', 'Agent domain')
    .addServer('/pmb', 'PMB domain')
    .addServer('/rsa', 'RSA domain')
    .addServer('/developer', 'Developer domain')
    .addServer('/uploader', 'Uploader domain')
    .addServer('/cooperative', 'Cooperative domain')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.PORT || 8080;
  await app.listen(port);
  logger.log(`MOFI platform API listening on port ${port}`);
}

bootstrap();
