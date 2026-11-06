import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RsaDocument } from './rsa-document.entity';
import {
  CreateRsaDocumentDto,
  UpdateRsaDocumentDto,
} from './rsa-document.dto';
import {
  UpdateDocumentStatusDto,
} from '../common/common.dto';
import { DocumentStatus } from '../common/common.type';
import { ErrorMessage } from '../common/common.enum';

@Injectable()
export class RsaDocumentService {
  constructor(
    @InjectRepository(RsaDocument, 'rsa')
    private readonly rsaDocumentRepository: Repository<RsaDocument>,
  ) { }

  async create(
    createRsaDocumentDto: CreateRsaDocumentDto,
  ): Promise<RsaDocument> {
    const { rsaId, ...rest } = createRsaDocumentDto;
    return this.rsaDocumentRepository.save({
      rsa: { id: rsaId },
      ...rest,
    });
  }

  async findAll(): Promise<RsaDocument[]> {
    return this.rsaDocumentRepository.find();
  }

  async findAllByRsa(rsaId: number): Promise<RsaDocument[]> {
    return await this.rsaDocumentRepository
      .createQueryBuilder()
      .where('rsa_id = :rsaId', { rsaId })
      .getMany();

    // Example with join
    // return await this.rsaDocumentRepository
    // .createQueryBuilder('rsaDocument')
    // .innerJoin('rsaDocument.rsa', 'rsa')
    // .where('rsa.id = :rsaId', { rsaId })
    // .getMany();
  }

  async findAllByUser(userId: number): Promise<RsaDocument[]> {
    return await this.rsaDocumentRepository
      .createQueryBuilder('rsaDocument')
      .innerJoin('rsaDocument.rsa', 'rsa')
      .innerJoin('rsa.user', 'user')
      .where('user.id = :userId', { userId })
      .getMany();
  }

  findOne(id: number): Promise<RsaDocument> {
    return this.rsaDocumentRepository.findOneBy({ id: id });
  }

  async updateOne(
    id: number,
    updateDto: UpdateRsaDocumentDto,
  ): Promise<RsaDocument> {
    const rsaDocument = await this.rsaDocumentRepository.findOneBy({ id });

    if (!rsaDocument) {
      throw new NotFoundException(
        `${RsaDocument.name} with ID ${id} not found`,
      );
    }

    this.rsaDocumentRepository.merge(rsaDocument, {
      ...updateDto,
      status: DocumentStatus.PENDING
    });
    return this.rsaDocumentRepository.save(rsaDocument);
  }

  async remove(id: number): Promise<void> {
    await this.rsaDocumentRepository.delete(id);
  }

  async updateStatus(
    id: number,
    updateDto: UpdateDocumentStatusDto,
  ): Promise<RsaDocument> {
    const proposedDevelopment =
      await this.rsaDocumentRepository.findOneBy({
        id,
      });

    if (!proposedDevelopment) {
      throw new NotFoundException(
        `${RsaDocument.name} with ID ${id} not found`,
      );
    }

    const { reviewerId } = updateDto;

    this.rsaDocumentRepository.merge(proposedDevelopment, {
      ...updateDto,
      reviewer: { id: reviewerId },
      reviewedAt: new Date().toISOString(),
    });
    return this.rsaDocumentRepository.save(proposedDevelopment);
  }
}
