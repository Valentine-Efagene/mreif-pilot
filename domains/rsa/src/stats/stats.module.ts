import { Module } from '@nestjs/common';
import { RsaController } from './stats.controller';
import { StatsService } from './stats.service';
import { RsaModule } from '../rsa/rsa.module';

@Module({
  imports: [
    RsaModule,
  ],
  providers: [StatsService],
  controllers: [RsaController],
  exports: [StatsService],
})
export class StatsModule { }
