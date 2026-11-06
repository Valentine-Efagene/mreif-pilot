import { BadRequestException, Injectable } from '@nestjs/common';
import { DeveloperDirectorDocument } from '../developer-director-document/developer-director-document.entity';
import { DeveloperDirectorDocumentService } from '../developer-director-document/developer-director-document.service';
import { DeveloperDocument } from '../developer-document/developer-document.entity';
import { DeveloperDocumentService } from '../developer-document/developer-document.service';
import { ProposedDevelopmentDocument } from '../proposed-development-document/proposed-development-document.entity';
import { ProposedDevelopmentDocumentService } from '../proposed-development-document/proposed-development-document.service';
import { S3UploaderService } from '../s3-uploader/s3-uploader.service';
import { DocumentReuploadDto } from './common.dto';
import { AbstractBaseDocumentEntity } from './common.entity';
import { DocumentModule } from './common.enum';
import { DocumentStatus } from './common.type';
import { DataSource } from 'typeorm';

@Injectable()
export class CommonService {
  constructor(
    private readonly developerDocumentService: DeveloperDocumentService,
    private readonly developerDirectorDocumentService: DeveloperDirectorDocumentService,
    private readonly proposedDevelopmentDocumentService: ProposedDevelopmentDocumentService,
    private readonly s3UploaderService: S3UploaderService,
  ) { }

  async findAllDocumentsByDeveloper(
    developerId: number,
  ): Promise<
    (
      | DeveloperDocument
      | DeveloperDirectorDocument
      | ProposedDevelopmentDocument
    )[]
  > {
    const result = Promise.all([
      ...(await this.developerDocumentService.findAllByDeveloper(developerId)),
      ...(await this.developerDirectorDocumentService.findAllByDeveloper(
        developerId,
      )),
      ...(await this.proposedDevelopmentDocumentService.findAllByDeveloper(
        developerId,
      )),
    ]);
    return result;
  }

  async findAllDocumentsByUser(
    userId: number,
  ): Promise<
    (
      | DeveloperDocument
      | DeveloperDirectorDocument
      | ProposedDevelopmentDocument
    )[]
  > {
    const result = Promise.all([
      ...(await this.developerDocumentService.findAllByUser(userId)),
      ...(await this.developerDirectorDocumentService.findAllByUser(userId)),
      ...(await this.proposedDevelopmentDocumentService.findAllByUser(userId)),
    ]);
    return result;
  }

  async reupload(
    dto: DocumentReuploadDto,
  ): Promise<
    AbstractBaseDocumentEntity
  > {
    const { id, module, url, ...rest } = dto
    switch (module) {
      case DocumentModule.DEVELOPER:
        const developerDocument = await this.developerDocumentService.findOne(id)

        if (!developerDocument) {
          throw new BadRequestException('Invalid document ID')
        }

        await this.s3UploaderService.deleteFromS3(
          developerDocument.url,
        );

        return this.developerDocumentService.updateOne(id, {
          url,
          status: DocumentStatus.PENDING,
          ...rest
        })

      case DocumentModule.DEVELOPER_DIRECTOR:
        const developerDirectorDocument = await this.developerDirectorDocumentService.findOne(id)

        if (!developerDirectorDocument) {
          throw new BadRequestException('Invalid document ID')
        }

        await this.s3UploaderService.deleteFromS3(
          developerDirectorDocument.url,
        );

        return this.developerDirectorDocumentService.updateOne(id, {
          url,
          status: DocumentStatus.PENDING,
          ...rest,
        })

      case DocumentModule.PROPOSED_DEVELOPMENT:
        const proposedDevelopmentDocument = await this.proposedDevelopmentDocumentService.findOne(id)

        if (!proposedDevelopmentDocument) {
          throw new BadRequestException('Invalid document ID')
        }

        await this.s3UploaderService.deleteFromS3(
          proposedDevelopmentDocument.url,
        );

        return this.proposedDevelopmentDocumentService.updateOne(id, {
          url,
          status: DocumentStatus.PENDING,
          ...rest
        })

      default:
        throw new BadRequestException('Please provide a valid module')
    }
  }
}
