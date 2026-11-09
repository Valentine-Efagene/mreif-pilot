import { Logger } from '@nestjs/common';
import { UploaderAppModule } from './uploader-app.module';
import { bootstrapHttpApp } from '../../../apps/_shared/bootstrap-http-app';

bootstrapHttpApp(UploaderAppModule, {
  globalPrefix: 'uploader',
  swaggerTitle: 'MOFI Uploader API',
}).then(() =>
  new Logger('UploaderDomain').log('Uploader domain listening'),
);
