import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { DeveloperDocument } from './developer-document.entity';
import {
  CreateDeveloperDocumentDto,
} from './developer-document.dto';
import {
  UpdateDocumentDto,
  UpdateDocumentStatusDto,
} from '../common/common.dto';
import { DocumentStatus } from '../common/common.type';
import { S3UploaderService } from '../s3-uploader/s3-uploader.service';
import { Developer } from '../developer/developer.entity';
import { ApprovalStatus } from '../common/common.enum';
import { DeveloperService } from '../developer/developer.service';
import DataHelper from '../common/helpers/DataHelper';
import { Request } from 'express';

@Injectable()
export class DeveloperDocumentService {
  constructor(
    @InjectRepository(DeveloperDocument, 'developer')
    private readonly developerDocumentRepository: Repository<DeveloperDocument>,

    private readonly developerService: DeveloperService,
    private readonly uploaderService: S3UploaderService,
    private dataSource: DataSource,
  ) { }

  async create(
    createDeveloperDocumentDto: CreateDeveloperDocumentDto,
    request: Request,
  ): Promise<DeveloperDocument> {
    const { developerId, ...rest } = createDeveloperDocumentDto;

    await DataHelper.safeCheckDeveloperChild(
      developerId, this.developerService, request
    )

    return this.developerDocumentRepository.save({
      developer: { id: developerId },
      ...rest,
    });
  }

  async findAll(): Promise<DeveloperDocument[]> {
    return this.developerDocumentRepository.find();
  }

  async findAllByDeveloper(developerId: number): Promise<DeveloperDocument[]> {
    return await this.developerDocumentRepository
      .createQueryBuilder()
      .where('developer_id = :developerId', { developerId })
      .getMany();

    // Example with join
    // return await this.developerDocumentRepository
    // .createQueryBuilder('developerDocument')
    // .innerJoin('developerDocument.developer', 'developer')
    // .where('developer.id = :developerId', { developerId })
    // .getMany();
  }

  async findAllByUser(userId: number): Promise<DeveloperDocument[]> {
    return await this.developerDocumentRepository
      .createQueryBuilder('developerDocument')
      .innerJoin('developerDocument.developer', 'developer')
      .innerJoin('developer.user', 'user')
      .where('user.id = :userId', { userId })
      .getMany();
  }

  findOne(id: number): Promise<DeveloperDocument> {
    return this.developerDocumentRepository.findOneBy({ id: id });
  }

  async updateOne(
    id: number,
    updateDto: UpdateDocumentDto & { size?: number, status?: DocumentStatus },
  ): Promise<DeveloperDocument> {
    const document = await this.developerDocumentRepository.findOneBy({ id });

    if (!document) {
      throw new NotFoundException(
        `${DeveloperDocument.name} with ID ${id} not found`,
      );
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const developer = await queryRunner.manager.findOneBy(Developer, {
      id: document.developerId
    })

    const { status } = updateDto

    try {
      const reviewedAt = new Date().toISOString()
      queryRunner.manager.merge(Developer, developer, {
        status: (status && status === DocumentStatus.APPROVED) ? developer.status : ApprovalStatus.PENDING,
        reviewedAt
      })

      await queryRunner.manager.save(developer)

      queryRunner.manager.merge(DeveloperDocument, document, updateDto)
      const updated = await queryRunner.manager.save(document)

      await queryRunner.commitTransaction()
      return updated
    } catch (error) {
      queryRunner.rollbackTransaction()
      throw error
    }
  }

  async remove(id: number): Promise<void> {
    const document = await this.developerDocumentRepository.findOneBy({ id });

    if (document.url) {
      await this.uploaderService.deleteFromS3((await document).url);
    }
    await this.developerDocumentRepository.delete(id);
  }

  async updateStatus(
    id: number,
    updateDto: UpdateDocumentStatusDto,
  ): Promise<DeveloperDocument> {
    if (updateDto.status === DocumentStatus.DECLINED && !updateDto.declineReason) {
      throw new BadRequestException('Please provide a reason for declining')
    }

    return this.updateOne(id, {
      ...updateDto,
      reviewedAt: new Date().toISOString(),
    });
  }
}
