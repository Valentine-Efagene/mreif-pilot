import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Property } from './property.entity';
import { PropertyService } from './property.service';
import { PropertyController } from './property.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Property], 'developer')],
  providers: [PropertyService],
  controllers: [PropertyController],
  exports: [PropertyService]
})
export class PropertyModule { }
