import { Logger } from '@nestjs/common';
import { RsaAppModule } from './rsa-app.module';
import { bootstrapHttpApp } from '../../_shared/bootstrap-http-app';

bootstrapHttpApp(RsaAppModule, { globalPrefix: 'rsa' }).then(() =>
  new Logger('RsaDomain').log('RSA domain listening'),
);
