import { Module } from '@nestjs/common';
import { DeveloperDocumentModule } from '../developer-document/developer-document.module';
import { CommonController } from './common.controller';
import { ProposedDevelopmentDocumentModule } from '../proposed-development-document/proposed-development-document.module';
import { DeveloperDirectorDocumentModule } from '../developer-director-document/developer-director-document.module';
import { CommonService } from './common.service';
import { S3UploaderModule } from '../s3-uploader/s3-uploader.module';

@Module({
  imports: [
    DeveloperDirectorDocumentModule,
    ProposedDevelopmentDocumentModule,
    DeveloperDocumentModule,
    S3UploaderModule,
  ],
  providers: [CommonService],
  controllers: [CommonController],
  exports: [],
})
export class CommonModule { }
