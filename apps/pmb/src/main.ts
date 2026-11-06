import { Logger } from '@nestjs/common';
import { PmbAppModule } from './pmb-app.module';
import { bootstrapHttpApp } from '../../_shared/bootstrap-http-app';

bootstrapHttpApp(PmbAppModule, { globalPrefix: 'pmb' }).then(() =>
  new Logger('PmbDomain').log('PMB domain listening'),
);
