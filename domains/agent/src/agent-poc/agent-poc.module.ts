import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgentPoc } from './agent-poc.entity';
import { AgentPocController } from './agent-poc.controller';
import { AgentPocService } from './agent-poc.service';

@Module({
  imports: [TypeOrmModule.forFeature([AgentPoc], 'agent')],
  providers: [AgentPocService],
  controllers: [AgentPocController],
  exports: [AgentPocService],
})
export class AgentPocModule { }
