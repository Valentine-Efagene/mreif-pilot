import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RsaDocument } from './rsa-document.entity';
import { RsaDocumentController } from './rsa-document.controller';
import { RsaDocumentService } from './rsa-document.service';
import { S3UploaderModule } from '../s3-uploader/s3-uploader.module';

@Module({
  imports: [TypeOrmModule.forFeature([RsaDocument], 'rsa'), S3UploaderModule],
  providers: [RsaDocumentService],
  controllers: [RsaDocumentController],
  exports: [RsaDocumentService],
})
export class RsaDocumentModule { }
