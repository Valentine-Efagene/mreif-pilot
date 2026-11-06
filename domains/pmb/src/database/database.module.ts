import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseService } from './database.service';
import { DatabaseController } from './database.controller';

@Module({
  imports: [TypeOrmModule],
  providers: [DatabaseService],
  controllers: [DatabaseController],
})
export class DatabaseModule {}
