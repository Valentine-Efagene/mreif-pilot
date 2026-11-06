import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { S3UploaderModule } from '../s3-uploader/s3-uploader.module';
import { HomeOwnerDocument } from './home-owner-document.entity';
import { HomeOwnerDocumentService } from './home-owner-document.service';
import { HomeOwnerDocumentController } from './home-owner-document.controller';
import { HomeOwner } from '../home-owner/home-owner.entity';

@Module({
  imports: [TypeOrmModule.forFeature([HomeOwnerDocument, HomeOwner], 'agent'), S3UploaderModule],
  providers: [HomeOwnerDocumentService],
  controllers: [HomeOwnerDocumentController],
  exports: [HomeOwnerDocumentService]
})
export class HomeOwnerDocumentModule { }
