import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Referral } from './referral.entity';
import { ReferralService } from './referral.service';
import ReferralResolver from './referral.resolver';
import { ReferralController } from './referral.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Referral], 'agent')],
  providers: [ReferralService, ReferralResolver],
  controllers: [ReferralController],
  exports: [ReferralService]
})
export class ReferralModule { }
