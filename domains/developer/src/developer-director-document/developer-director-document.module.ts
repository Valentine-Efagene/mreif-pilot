import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeveloperDirectorDocument } from './developer-director-document.entity';
import { DeveloperDirectorDocumentController } from './developer-director-document.controller';
import { DeveloperDirectorDocumentService } from './developer-director-document.service';
import { S3UploaderModule } from '../s3-uploader/s3-uploader.module';
import { DeveloperModule } from '../developer/developer.module';
import { DeveloperDirector } from '../developer-director/developer-director.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([DeveloperDirectorDocument, DeveloperDirector], 'developer'),
    S3UploaderModule,
    DeveloperModule
  ],
  providers: [DeveloperDirectorDocumentService],
  controllers: [DeveloperDirectorDocumentController],
  exports: [DeveloperDirectorDocumentService],
})
export class DeveloperDirectorDocumentModule { }
