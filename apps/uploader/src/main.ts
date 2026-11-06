import { Logger } from '@nestjs/common';
import { UploaderAppModule } from './uploader-app.module';
import { bootstrapHttpApp } from '../../_shared/bootstrap-http-app';

bootstrapHttpApp(UploaderAppModule, { globalPrefix: 'uploader' }).then(() =>
  new Logger('UploaderDomain').log('Uploader domain listening'),
);
