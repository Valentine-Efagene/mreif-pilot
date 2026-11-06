import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MortgageApplicant } from './mortgage-applicant.entity';
import { MortgageApplicantService } from './mortgage-applicant.service';
import { MortgageApplicantController } from './mortgage-applicant.controller';

@Module({
  imports: [TypeOrmModule.forFeature([MortgageApplicant], 'pmb')],
  providers: [MortgageApplicantService],
  controllers: process.env.NODE_ENV === 'development' ? [MortgageApplicantController] : [],
  exports: [MortgageApplicantService]
})
export class MortgageApplicantModule { }
