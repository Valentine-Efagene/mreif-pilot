import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Rsa } from './rsa.entity';
import { RsaController } from './rsa.controller';
import { RsaService } from './rsa.service';
import { RsaRepository } from './rsa.repository';
import { RsaDocument } from '../rsa-document/rsa-document.entity';
import { NotificationModule } from '../notification/notification.module';
import { MortgageModule } from '../mortgage/mortgage.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Rsa, RsaDocument], 'rsa'),
    NotificationModule,
    MortgageModule,
  ],
  providers: [RsaService, RsaRepository],
  controllers: [RsaController],
  exports: [RsaService],
})
export class RsaModule { }
