import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MofiAuthModule } from '../../../libs/auth/src/auth.module';
import { UploaderDomainModule } from '../../../domains/uploader/src/uploader-domain.module';
import { createDomainHealthController } from '../../../libs/common/src/domain-health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MofiAuthModule.forRoot(),
    UploaderDomainModule,
  ],
  controllers: [createDomainHealthController('uploader')],
})
export class UploaderAppModule {}
