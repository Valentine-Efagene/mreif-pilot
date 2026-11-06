import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cooperative } from './cooperative.entity';
import { CooperativeController } from './cooperative.controller';
import { CooperativeService } from './cooperative.service';
import { S3UploaderModule } from '../s3-uploader/s3-uploader.module';
import { HttpModule } from '@nestjs/axios';
import { User } from '../user/user.entity';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Cooperative, User], 'cooperative'),
    S3UploaderModule,
    HttpModule,
    UserModule
  ],
  providers: [CooperativeService],
  controllers: [CooperativeController],
  exports: [CooperativeService],
})
export class CooperativeModule { }
