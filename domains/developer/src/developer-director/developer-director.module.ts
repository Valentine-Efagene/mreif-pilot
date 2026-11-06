import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeveloperDirector } from './developer-director.entity';
import { DeveloperDirectorController } from './developer-director.controller';
import { DeveloperDirectorService } from './developer-director.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([DeveloperDirector], 'developer')
  ],
  providers: [DeveloperDirectorService],
  controllers: [DeveloperDirectorController],
})
export class DeveloperDirectorModule { }
