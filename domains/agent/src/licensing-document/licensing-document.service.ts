import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LicensingDocument } from './licensing-document.entity';
import {
  CreateLicensingDocumentDto,
  UpdateLicensingDocumentDto,
  UpdateLicensingDocumentStatusDto,
} from './licensing-document.dto';
import { DocumentStatus, ErrorMessage } from '../common/common.enum';
import { Agent } from '../agent/agent.entity';
import { Status } from '../common/common.type';

@Injectable()
export class LicensingDocumentService {
  constructor(
    @InjectRepository(LicensingDocument, 'agent')
    private readonly licensingDocumentRepository: Repository<LicensingDocument>,
    @InjectRepository(Agent, 'agent')
    private readonly agentRepository: Repository<Agent>,
  ) { }

  async create(
    createLicensingDocumentDto: CreateLicensingDocumentDto,
  ): Promise<LicensingDocument> {
    const { licensingInfoId, ...rest } = createLicensingDocumentDto;
    return this.licensingDocumentRepository.save({
      user: { id: licensingInfoId },
      ...rest,
    });
  }

  async findAll(): Promise<LicensingDocument[]> {
    return this.licensingDocumentRepository.find();
  }

  async findAllByAgent(agentId: number): Promise<LicensingDocument[]> {
    return await this.licensingDocumentRepository
      .createQueryBuilder('licensingDocument')
      .leftJoin('licensingDocument.licensingInfo', 'licensingInfo')
      .leftJoin('licensingInfo.agent', 'agent')
      .where('agent.id = :agentId', { agentId })
      .getMany();
  }

  async findAllByUser(userId: number): Promise<LicensingDocument[]> {
    return await this.licensingDocumentRepository
      .createQueryBuilder()
      .where('user_id = :userId', { userId })
      .getMany();
  }

  findOne(id: number): Promise<LicensingDocument> {
    return this.licensingDocumentRepository.findOneBy({ id });
  }

  async updateOne(
    id: number,
    updateDto: UpdateLicensingDocumentDto & { size?: number; url?: string },
  ): Promise<LicensingDocument> {
    const licensingDocument = await this.licensingDocumentRepository.findOne({
      where: { id },
      relations: { licensingInfo: true },
    });

    if (!licensingDocument) {
      throw new NotFoundException(
        `${LicensingDocument.name} with ID ${id} not found`,
      );
    }

    this.licensingDocumentRepository.merge(licensingDocument, {
      ...updateDto,
      status: DocumentStatus.PENDING,
    });

    const agentId = licensingDocument.licensingInfo.agentId;
    // Return agent to pendings if document is reuploaded
    const agent = await this.agentRepository.findOneBy({ id: agentId });
    if (agent.status !== 'PENDING') {
      this.agentRepository.merge(agent, { status: Status.PENDING });
      await this.agentRepository.save(agent);
    }

    return this.licensingDocumentRepository.save(licensingDocument);
  }

  async remove(id: number): Promise<void> {
    const document = await this.licensingDocumentRepository.findOneBy({ id });

    await this.licensingDocumentRepository.delete(document.id);
  }

  async updateStatus(
    id: number,
    updateDto: UpdateLicensingDocumentStatusDto,
  ): Promise<LicensingDocument> {
    if (
      updateDto.status === DocumentStatus.DECLINED &&
      !updateDto.declineReason
    ) {
      throw new BadRequestException(ErrorMessage.NO_REASON_DECLINE);
    }

    if (updateDto.status !== DocumentStatus.DECLINED) {
      updateDto.declineReason = null
    }

    const licensingDocument = await this.licensingDocumentRepository.findOneBy({
      id,
    });

    if (!licensingDocument) {
      throw new NotFoundException(
        `${LicensingDocument.name} with ID ${id} not found`,
      );
    }

    const { reviewerId, ...rest } = updateDto;

    this.licensingDocumentRepository.merge(licensingDocument, {
      ...rest,
      reviewer: { id: reviewerId },
      reviewedAt: new Date().toISOString(),
    });
    return this.licensingDocumentRepository.save(licensingDocument);
  }

  async reupload(
    id: number,
    dto: UpdateLicensingDocumentDto,
  ): Promise<LicensingDocument> {
    return await this.updateOne(id, dto);
  }
}
