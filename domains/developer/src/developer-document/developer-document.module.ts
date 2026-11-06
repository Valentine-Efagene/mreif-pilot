import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeveloperDocument } from './developer-document.entity';
import { DeveloperDocumentController } from './developer-document.controller';
import { DeveloperDocumentService } from './developer-document.service';
import { S3UploaderModule } from '../s3-uploader/s3-uploader.module';
import { Developer } from '../developer/developer.entity';
import { DeveloperModule } from '../developer/developer.module';

@Module({
  imports: [TypeOrmModule.forFeature([DeveloperDocument, Developer], 'developer'), S3UploaderModule, DeveloperModule],
  providers: [DeveloperDocumentService],
  controllers: [DeveloperDocumentController],
  exports: [DeveloperDocumentService],
})
export class DeveloperDocumentModule { }
