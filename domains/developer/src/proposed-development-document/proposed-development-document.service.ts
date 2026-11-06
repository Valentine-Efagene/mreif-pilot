import { BadRequestException, forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ProposedDevelopmentDocument } from './proposed-development-document.entity';
import {
  CreateManyProposedDevelopmentDocumentsDto,
  CreateProposedDevelopmentDocumentDto,
} from './proposed-development-document.dto';
import { DocumentStatus } from '../common/common.type';
import { DeveloperDocument } from '../developer-document/developer-document.entity';
import {
  DeclineDocumentDto,
  UpdateDocumentDto,
  UpdateDocumentStatusDto,
} from '../common/common.dto';
import { S3UploaderService } from '../s3-uploader/s3-uploader.service';
import { ProposedDevelopment } from '../proposed-development/proposed-development.entity';
import { ProposedDevelopmentApprovalStatus } from '../proposed-development/proposed-development.enums';
import DataHelper from '../common/helpers/DataHelper';
import { ProposedDevelopmentService } from '../proposed-development/proposed-development.service';
import { Request } from 'express';

@Injectable()
export class ProposedDevelopmentDocumentService {
  constructor(
    @InjectRepository(ProposedDevelopmentDocument, 'developer')
    private readonly proposedDevelopmentDocumentRepository: Repository<ProposedDevelopmentDocument>,

    private readonly uploaderService: S3UploaderService,
    private readonly proposedDevelopmentService: ProposedDevelopmentService,
    private dataSource: DataSource,
  ) { }

  async create(
    createProposedDevelopmentDocumentDto: CreateProposedDevelopmentDocumentDto,
    request: Request
  ): Promise<ProposedDevelopmentDocument> {
    const { proposedDevelopmentId, ...rest } =
      createProposedDevelopmentDocumentDto;

    await DataHelper.safeCheckProposedDevelopmentChild(
      proposedDevelopmentId,
      this.proposedDevelopmentService,
      request
    )

    return this.proposedDevelopmentDocumentRepository.save({
      proposedDevelopment: { id: proposedDevelopmentId },
      ...rest,
    });
  }

  async createMany(
    dto: CreateManyProposedDevelopmentDocumentsDto,
  ): Promise<ProposedDevelopmentDocument[]> {
    const { proposedDevelopmentId } = dto;

    const bulkDto = dto.documents.map(
      (createDto) => {
        return {
          proposedDevelopment: { id: proposedDevelopmentId },
          ...createDto,
        };
      },
    );

    return this.proposedDevelopmentDocumentRepository.save(bulkDto);
  }

  async findAllByUser(userId: number): Promise<ProposedDevelopmentDocument[]> {
    return await this.proposedDevelopmentDocumentRepository
      .createQueryBuilder('proposedDevelopmentDocument')
      .innerJoin(
        'proposedDevelopmentDocument.proposedDevelopment',
        'proposedDevelopment',
      )
      .innerJoin('proposedDevelopment.developer', 'developer')
      .innerJoin('developer.user', 'user')
      .where('user.id = :userId', { userId })
      .getMany();
  }

  async findAllByProposedDevelopment(proposedDevelopmentId: number): Promise<ProposedDevelopmentDocument[]> {
    return await this.proposedDevelopmentDocumentRepository
      .createQueryBuilder()
      .where('proposed_development_id = :proposedDevelopmentId', { proposedDevelopmentId })
      .getMany();
  }

  async findAll(): Promise<ProposedDevelopmentDocument[]> {
    return this.proposedDevelopmentDocumentRepository.find();
  }

  async findAllByDeveloper(
    developerId: number,
  ): Promise<ProposedDevelopmentDocument[]> {
    return await this.proposedDevelopmentDocumentRepository
      .createQueryBuilder('proposedDevelopmentDocument')
      .innerJoin(
        'proposedDevelopmentDocument.proposedDevelopment',
        'proposedDevelopment',
      )
      .innerJoin('proposedDevelopment.developer', 'developer')
      .where('developer.id = :developerId', { developerId })
      .getMany();
  }

  findOne(id: number): Promise<ProposedDevelopmentDocument> {
    return this.proposedDevelopmentDocumentRepository.findOneBy({ id: id });
  }

  async updateOne(
    id: number,
    updateDto: UpdateDocumentDto & { size?: number, status?: DocumentStatus },
  ): Promise<ProposedDevelopmentDocument> {
    const document = await this.proposedDevelopmentDocumentRepository.findOneBy(
      { id },
    );

    if (!document) {
      throw new NotFoundException(
        `${ProposedDevelopmentDocument.name} with ID ${id} not found`,
      );
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const proposedDevelopmentRepository = this.dataSource.getRepository(ProposedDevelopment)

      const proposedDevelopment = await proposedDevelopmentRepository.findOneBy({ id: document.proposedDevelopmentId })

      this.proposedDevelopmentDocumentRepository.merge(document, updateDto)

      const { status } = updateDto

      proposedDevelopmentRepository.merge(proposedDevelopment, {
        status: (status && status === DocumentStatus.APPROVED) ? proposedDevelopment.status : ProposedDevelopmentApprovalStatus.PENDING,
        reviewedAt: new Date().toISOString()
      })

      await queryRunner.manager.save(proposedDevelopment)
      const updated = await queryRunner.manager.save(document)

      await queryRunner.commitTransaction()
      return updated
    } catch (error) {
      queryRunner.rollbackTransaction()
      throw error
    }
  }

  async remove(id: number): Promise<void> {
    const document = await this.proposedDevelopmentDocumentRepository.findOneBy(
      {
        id,
      },
    );

    if (document.url) {
      await this.uploaderService.deleteFromS3(document.url);
    }

    await this.proposedDevelopmentDocumentRepository.delete(id);
  }

  async updateStatus(
    id: number,
    updateDto: UpdateDocumentStatusDto,
  ): Promise<ProposedDevelopmentDocument> {
    if ((updateDto.status == DocumentStatus.DECLINED) && !updateDto.declineReason) {
      throw new BadRequestException('Please provide a reason for declining')
    }

    const proposedDevelopment =
      await this.proposedDevelopmentDocumentRepository.findOneBy({
        id,
      });

    if (!proposedDevelopment) {
      throw new NotFoundException(
        `${DeveloperDocument.name} with ID ${id} not found`,
      );
    }

    return this.updateOne(id, {
      ...updateDto,
      reviewedAt: new Date().toISOString()
    });
  }

  async decline(
    id: number,
    updateDto: DeclineDocumentDto,
  ): Promise<ProposedDevelopmentDocument> {
    const document = await this.proposedDevelopmentDocumentRepository.findOneBy(
      {
        id,
      },
    );

    if (!document) {
      throw new NotFoundException(
        `${DeveloperDocument.name} with ID ${id} not found`,
      );
    }

    return this.updateOne(id, {
      ...updateDto,
      reviewedAt: new Date().toISOString(),
      status: DocumentStatus.DECLINED,
    })
  }
}
