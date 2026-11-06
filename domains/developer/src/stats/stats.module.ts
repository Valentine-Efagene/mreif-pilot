import { Module } from '@nestjs/common';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';
import { ProposedDevelopmentModule } from '../proposed-development/proposed-development.module';

@Module({
  imports: [
    ProposedDevelopmentModule
  ],
  providers: [StatsService],
  controllers: [StatsController],
  exports: [StatsService],
})
export class StatsModule { }
