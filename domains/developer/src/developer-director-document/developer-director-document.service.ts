import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { DeveloperDirectorDocument } from './developer-director-document.entity';
import {
  CreateDeveloperDirectorDocumentDto,
} from './developer-director-document.dto';
import {
  DeclineDocumentDto,
  UpdateDocumentDto,
  UpdateDocumentStatusDto,
} from '../common/common.dto';
import { DocumentStatus } from '../common/common.type';
import { S3UploaderService } from '../s3-uploader/s3-uploader.service';
import { DeveloperDirector } from '../developer-director/developer-director.entity';
import { Developer } from '../developer/developer.entity';
import { ApprovalStatus } from '../common/common.enum';
import DataHelper from '../common/helpers/DataHelper';
import { DeveloperService } from '../developer/developer.service';
import { Request } from 'express';

@Injectable()
export class DeveloperDirectorDocumentService {
  constructor(
    @InjectRepository(DeveloperDirectorDocument, 'developer')
    private readonly developerDirectorDocumentRepository: Repository<DeveloperDirectorDocument>,
    @InjectRepository(DeveloperDirector, 'developer')
    private readonly developerDirectorRepository: Repository<DeveloperDirector>,
    private readonly uploaderService: S3UploaderService,
    private readonly developerService: DeveloperService,
    @InjectDataSource('developer')
    private dataSource: DataSource,
  ) { }

  async create(
    createDeveloperDirectorDocumentDto: CreateDeveloperDirectorDocumentDto,
    request: Request,
  ): Promise<DeveloperDirectorDocument> {
    const { developerDirectorId, ...rest } = createDeveloperDirectorDocumentDto;
    const developerDirector = await this.developerDirectorRepository.findOneBy({
      id: developerDirectorId
    })

    await DataHelper.safeCheckDeveloperChild(
      developerDirector.developerId, this.developerService, request
    )

    return this.developerDirectorDocumentRepository.save({
      developerDirector: { id: developerDirectorId },
      ...rest,
    });
  }

  async findAll(): Promise<DeveloperDirectorDocument[]> {
    return this.developerDirectorDocumentRepository.find();
  }

  async findAllByDeveloper(
    developerId: number,
  ): Promise<DeveloperDirectorDocument[]> {
    return await this.developerDirectorDocumentRepository
      .createQueryBuilder('developerDirectorDocument')
      .innerJoin(
        'developerDirectorDocument.developerDirector',
        'developerDirector',
      )
      .innerJoin('developerDirector.developer', 'developer')
      .where('developer.id = :developerId', { developerId })
      .getMany();
  }

  async findAllByUser(userId: number): Promise<DeveloperDirectorDocument[]> {
    return await this.developerDirectorDocumentRepository
      .createQueryBuilder('developerDirectorDocument')
      .innerJoin(
        'developerDirectorDocument.developerDirector',
        'developerDirector',
      )
      .innerJoin('developerDirector.developer', 'developer')
      .innerJoin('developer.user', 'user')
      .where('user.id = :userId', { userId })
      .getMany();
  }

  findOne(id: number): Promise<DeveloperDirectorDocument> {
    return this.developerDirectorDocumentRepository.findOneBy({ id: id });
  }

  async updateOne(
    id: number,
    updateDto: UpdateDocumentDto & { size?: number, status?: DocumentStatus },
  ): Promise<DeveloperDirectorDocument> {
    const document = await this.developerDirectorDocumentRepository.findOneBy({
      id,
    });

    if (updateDto.url && document.url !== updateDto.url) {
      await this.uploaderService.deleteFromS3(document.url);
    }

    const queryRunner = this.dataSource.createQueryRunner();

    const reviewedAt = new Date().toISOString()

    if (!document) {
      throw new NotFoundException(
        `${DeveloperDirectorDocument.name} with ID ${id} not found`,
      );
    }

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();
      const developerRepository = this.dataSource.getRepository(Developer)

      const developerDirectorRepository = this.dataSource.getRepository(DeveloperDirector)
      const director = await developerDirectorRepository.findOneBy({ id: document.developerDirectorId })

      const developer = await developerRepository.findOneBy({ id: director.developerId })

      this.developerDirectorDocumentRepository.merge(document, updateDto)

      const { status } = updateDto

      developerRepository.merge(developer, {
        status: (status && status === DocumentStatus.APPROVED) ? developer.status : ApprovalStatus.PENDING,
        reviewedAt
      })

      await queryRunner.manager.save(developer)
      const updated = await queryRunner.manager.save(document)

      await queryRunner.commitTransaction()
      return updated
    } catch (error) {
      queryRunner.rollbackTransaction()
      throw error
    }
  }

  async remove(id: number): Promise<void> {
    const document = await this.developerDirectorDocumentRepository.findOneBy({
      id,
    });

    if (document.url) {
      await this.uploaderService.deleteFromS3(document.url);
    }

    await this.developerDirectorDocumentRepository.delete(id);
  }

  async updateStatus(
    id: number,
    updateDto: UpdateDocumentStatusDto,
  ): Promise<DeveloperDirectorDocument> {
    if (updateDto.status == DocumentStatus.DECLINED && !updateDto.declineReason) {
      throw new BadRequestException('Please provide a reason for declining')
    }

    const document =
      await this.developerDirectorDocumentRepository.findOneBy({
        id,
      });

    if (!document) {
      throw new NotFoundException(
        `${DeveloperDirectorDocument.name} with ID ${id} not found`,
      );
    }

    return this.updateOne(id, {
      ...updateDto,
      reviewedAt: new Date().toISOString()
    })
  }

  async decline(
    id: number,
    updateDto: DeclineDocumentDto,
  ): Promise<DeveloperDirectorDocument> {
    const document = await this.developerDirectorDocumentRepository.findOneBy({
      id,
    });

    if (!document) {
      throw new NotFoundException(
        `${DeveloperDirectorDocument.name} with ID ${id} not found`,
      );
    }

    this.updateOne(id, {
      ...updateDto,
      reviewedAt: new Date().toISOString(),
      status: DocumentStatus.DECLINED,
    });
    return this.developerDirectorDocumentRepository.save(document);
  }
}
