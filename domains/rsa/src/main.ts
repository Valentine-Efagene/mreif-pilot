import { Logger } from '@nestjs/common';
import { RsaAppModule } from './rsa-app.module';
import { bootstrapHttpApp } from '../../../apps/_shared/bootstrap-http-app';

bootstrapHttpApp(RsaAppModule, {
  globalPrefix: 'rsa',
  swaggerTitle: 'MOFI RSA API',
}).then(() =>
  new Logger('RsaDomain').log('RSA domain listening'),
);
