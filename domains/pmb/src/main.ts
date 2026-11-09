import { Logger } from '@nestjs/common';
import { PmbAppModule } from './pmb-app.module';
import { bootstrapHttpApp } from '../../../apps/_shared/bootstrap-http-app';

bootstrapHttpApp(PmbAppModule, {
  globalPrefix: 'pmb',
  swaggerTitle: 'MOFI PMB API',
}).then(() =>
  new Logger('PmbDomain').log('PMB domain listening'),
);
