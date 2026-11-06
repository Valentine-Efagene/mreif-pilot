import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Mortgage } from './mortgage.entity';
import { MortgageService } from './mortgage.service';
import { MortgageController } from './mortgage.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Mortgage], 'pmb')],
  providers: [MortgageService],
  controllers: process.env.NODE_ENV === 'development' ? [MortgageController] : [],
  exports: [MortgageService]
})
export class MortgageModule { }
