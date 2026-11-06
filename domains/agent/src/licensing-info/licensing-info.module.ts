import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LicensingInfo } from './licensing-info.entity';
import { LicensingInfoService } from './licensing-info.service';
import LicensingInfoResolver from './licensing-info.resolver';
import { LicensingInfoController } from './licensing-info.controller';

@Module({
  imports: [TypeOrmModule.forFeature([LicensingInfo], 'agent')],
  providers: [LicensingInfoService, LicensingInfoResolver],
  controllers: [LicensingInfoController],
})
export class LicensingInfoModule { }
