import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProposedDevelopmentDocument } from './proposed-development-document.entity';
import { ProposedDevelopmentDocumentController } from './proposed-development-document.controller';
import { ProposedDevelopmentDocumentService } from './proposed-development-document.service';
import { S3UploaderModule } from '../s3-uploader/s3-uploader.module';
import { ProposedDevelopmentModule } from '../proposed-development/proposed-development.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProposedDevelopmentDocument], 'developer'),
    S3UploaderModule,
    ProposedDevelopmentModule
  ],
  providers: [ProposedDevelopmentDocumentService],
  controllers: [ProposedDevelopmentDocumentController],
  exports: [ProposedDevelopmentDocumentService],
})
export class ProposedDevelopmentDocumentModule { }
