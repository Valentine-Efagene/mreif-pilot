import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProposedProperty } from './proposed-property.entity';
import { ProposedPropertyController } from './proposed-property.controller';
import { ProposedPropertyService } from './proposed-property.service';
import { ProposedDevelopmentRepository } from '../proposed-development/proposed-development.repository';

@Module({
  imports: [TypeOrmModule.forFeature([ProposedProperty], 'developer')],
  providers: [ProposedPropertyService],
  controllers: [ProposedPropertyController],
  exports: [ProposedPropertyService]
})
export class ProposedPropertyModule { }
