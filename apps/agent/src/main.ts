import { Logger } from '@nestjs/common';
import { AgentAppModule } from './agent-app.module';
import { bootstrapHttpApp } from '../../_shared/bootstrap-http-app';

async function bootstrap() {
  const logger = new Logger('AgentDomain');
  await bootstrapHttpApp(AgentAppModule, { globalPrefix: 'agent' });
  logger.log('Agent domain listening');
}

bootstrap();
