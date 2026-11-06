import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Mortgage } from './mortgage.entity';
import { MortgageService } from './mortgage.service';
import { MortgageController } from './mortgage.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Mortgage], 'rsa')],
  providers: [MortgageService],
  controllers: process.env.DB_HOST === 'localhost' ? [MortgageController] : [],
  exports: [MortgageService]
})
export class MortgageModule { }
