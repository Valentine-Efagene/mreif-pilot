import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MofiAuthModule } from '../../../libs/auth/src/auth.module';
import { createDomainHealthController } from '../../../libs/common/src/domain-health.controller';
import { UploaderDomainModule } from './uploader-domain.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MofiAuthModule.forRoot(),
    UploaderDomainModule,
  ],
  controllers: [createDomainHealthController('uploader')],
})
export class UploaderAppModule {}
