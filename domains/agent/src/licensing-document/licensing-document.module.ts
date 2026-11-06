import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LicensingDocument } from './licensing-document.entity';
import { LicensingDocumentService } from './licensing-document.service';
import LicensingDocumentResolver from './licensing-document.resolver';
import { LicensingDocumentController } from './licensing-document.controller';
import { S3UploaderModule } from '../s3-uploader/s3-uploader.module';
import { Agent } from '../agent/agent.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LicensingDocument, Agent], 'agent'), S3UploaderModule],
  providers: [LicensingDocumentService, LicensingDocumentResolver],
  controllers: [LicensingDocumentController],
  exports: [LicensingDocumentService]
})
export class LicensingDocumentModule { }
