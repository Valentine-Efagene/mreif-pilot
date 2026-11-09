import { Logger } from '@nestjs/common';
import { AgentAppModule } from './agent-app.module';
import { bootstrapHttpApp } from '../../../apps/_shared/bootstrap-http-app';

async function bootstrap() {
  const logger = new Logger('AgentDomain');
  await bootstrapHttpApp(AgentAppModule, {
    globalPrefix: 'agent',
    swaggerTitle: 'MOFI Agent API',
  });
  logger.log('Agent domain listening');
}

bootstrap();
