import { Module } from '@nestjs/common';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';
import { CooperativeModule } from '../cooperative/cooperative.module';

@Module({
  imports: [
    CooperativeModule,
  ],
  providers: [StatsService],
  controllers: [StatsController],
  exports: [StatsService],
})
export class StatsModule { }
