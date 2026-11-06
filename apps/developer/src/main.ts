import { Logger } from '@nestjs/common';
import { DeveloperAppModule } from './developer-app.module';
import { bootstrapHttpApp } from '../../_shared/bootstrap-http-app';

bootstrapHttpApp(DeveloperAppModule, { globalPrefix: 'developer' }).then(() =>
  new Logger('DeveloperDomain').log('Developer domain listening'),
);
