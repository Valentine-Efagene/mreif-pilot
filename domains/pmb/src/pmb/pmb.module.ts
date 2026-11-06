import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pmb } from './pmb.entity';
import { PmbController } from './pmb.controller';
import { PmbService } from './pmb.service';
import { PmbRepository } from './pmb.repository';
import { S3UploaderModule } from '../s3-uploader/s3-uploader.module';
import { HttpModule } from '@nestjs/axios';
import { User } from '../user/user.entity';
import { Mortgage } from '../mortgage/mortgage.entity';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Pmb, User, Mortgage], 'pmb'),
    S3UploaderModule,
    HttpModule,
    UserModule
  ],
  providers: [PmbService, PmbRepository],
  controllers: [PmbController],
  exports: [PmbService],
})
export class PmbModule { }
