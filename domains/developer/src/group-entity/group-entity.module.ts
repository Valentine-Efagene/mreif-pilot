import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupEntity } from './group-entity.entity';
import { GroupEntityController } from './group-entity.controller';
import { GroupEntityService } from './group-entity.service';
import { DeveloperModule } from '../developer/developer.module';

@Module({
  imports: [TypeOrmModule.forFeature([GroupEntity], 'developer'), DeveloperModule],
  providers: [GroupEntityService],
  controllers: [GroupEntityController],
  exports: [GroupEntityService],
})
export class GroupEntityModule {}
