import { Module } from '@nestjs/common';
import { PmbController } from './stats.controller';
import { StatsService } from './stats.service';
import { PmbModule } from '../pmb/pmb.module';

@Module({
  imports: [
    PmbModule,
  ],
  providers: [StatsService],
  controllers: [PmbController],
  exports: [StatsService],
})
export class StatsModule { }
