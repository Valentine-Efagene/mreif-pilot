import { Logger } from '@nestjs/common';
import { DeveloperAppModule } from './developer-app.module';
import { bootstrapHttpApp } from '../../../apps/_shared/bootstrap-http-app';

bootstrapHttpApp(DeveloperAppModule, {
  globalPrefix: 'developer',
  swaggerTitle: 'MOFI Developer API',
}).then(() =>
  new Logger('DeveloperDomain').log('Developer domain listening'),
);
