import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Commission } from './commission.entity';
import { CommissionService } from './commission.service';
import CommissionResolver from './commission.resolver';
import { CommissionController } from './commission.controller';
import { Referral } from '../referral/referral.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Commission, Referral], 'agent')],
  providers: [CommissionService, CommissionResolver],
  controllers: [CommissionController],
  exports: [CommissionService]
})
export class CommissionModule { }
