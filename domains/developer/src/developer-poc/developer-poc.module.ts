import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeveloperPoc } from './developer-poc.entity';
import { DeveloperPocController } from './developer-poc.controller';
import { DeveloperPocService } from './developer-poc.service';

@Module({
  imports: [TypeOrmModule.forFeature([DeveloperPoc], 'developer')],
  providers: [DeveloperPocService],
  controllers: [DeveloperPocController],
})
export class DeveloperPocModule { }
