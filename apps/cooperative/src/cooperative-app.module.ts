import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MofiAuthModule } from '../../../libs/auth/src/auth.module';
import { CooperativeDomainModule } from '../../../domains/cooperative/src/cooperative-domain.module';
import { createDomainHealthController } from '../../../libs/common/src/domain-health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MofiAuthModule.forRoot(),
    CooperativeDomainModule,
  ],
  controllers: [createDomainHealthController('cooperative')],
})
export class CooperativeAppModule {}
