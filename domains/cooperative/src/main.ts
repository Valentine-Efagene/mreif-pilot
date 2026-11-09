import { Logger } from '@nestjs/common';
import { CooperativeAppModule } from './cooperative-app.module';
import { bootstrapHttpApp } from '../../../apps/_shared/bootstrap-http-app';

bootstrapHttpApp(CooperativeAppModule, {
  globalPrefix: 'cooperative',
  swaggerTitle: 'MOFI Cooperative API',
}).then(() =>
  new Logger('CooperativeDomain').log('Cooperative domain listening'),
);
