import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MofiAuthModule } from '../../../libs/auth/src/auth.module';
import { createDomainHealthController } from '../../../libs/common/src/domain-health.controller';
import { CooperativeDomainModule } from './cooperative-domain.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MofiAuthModule.forRoot(),
    CooperativeDomainModule,
  ],
  controllers: [createDomainHealthController('cooperative')],
})
export class CooperativeAppModule {}
