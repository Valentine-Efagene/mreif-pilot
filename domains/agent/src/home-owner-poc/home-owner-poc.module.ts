import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HomeOwnerPoc } from './home-owner-poc.entity';
import { HomeOwnerPocController } from './home-owner-poc.controller';
import { HomeOwnerPocService } from './home-owner-poc.service';

@Module({
  imports: [TypeOrmModule.forFeature([HomeOwnerPoc], 'agent')],
  providers: [HomeOwnerPocService],
  controllers: [HomeOwnerPocController],
  exports: [HomeOwnerPocService],
})
export class HomeOwnerPocModule { }
