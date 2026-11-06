import { Logger } from '@nestjs/common';
import { CooperativeAppModule } from './cooperative-app.module';
import { bootstrapHttpApp } from '../../_shared/bootstrap-http-app';

bootstrapHttpApp(CooperativeAppModule, { globalPrefix: 'cooperative' }).then(() =>
  new Logger('CooperativeDomain').log('Cooperative domain listening'),
);
