import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { EdgeModule } from './edge.module';
import { normalizeMofiEnv } from '../../../libs/database/src/normalize-env';

const DOMAIN_ROUTES: Array<{ prefix: string; envKey: string; defaultPort: number }> = [
  { prefix: '/agent', envKey: 'AGENT_UPSTREAM', defaultPort: 3001 },
  { prefix: '/pmb', envKey: 'PMB_UPSTREAM', defaultPort: 3002 },
  { prefix: '/rsa', envKey: 'RSA_UPSTREAM', defaultPort: 3003 },
  { prefix: '/developer', envKey: 'DEVELOPER_UPSTREAM', defaultPort: 3004 },
  { prefix: '/uploader', envKey: 'UPLOADER_UPSTREAM', defaultPort: 3005 },
  { prefix: '/cooperative', envKey: 'COOPERATIVE_UPSTREAM', defaultPort: 3006 },
];

async function bootstrap() {
  normalizeMofiEnv();
  const logger = new Logger('Edge');
  const app = await NestFactory.create(EdgeModule, { logger: ['error', 'warn', 'log'] });
  app.enableCors({ origin: true, allowedHeaders: '*', methods: '*' });

  const config = app.get(ConfigService);
  const expressApp = app.getHttpAdapter().getInstance();

  for (const route of DOMAIN_ROUTES) {
    const target =
      config.get<string>(route.envKey) ??
      `http://127.0.0.1:${route.defaultPort}`;
    expressApp.use(
      route.prefix,
      createProxyMiddleware({
        target,
        changeOrigin: true,
      }),
    );
    logger.log(`Proxy ${route.prefix} → ${target}`);
  }

  const port = config.get<number>('PORT') ?? 8080;
  await app.listen(port);
  logger.log(`Edge listening on ${port}`);
}

bootstrap();
