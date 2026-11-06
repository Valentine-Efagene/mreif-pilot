import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DocumentStatus, ErrorMessage } from '../common/common.enum';
import { HomeOwnerDocument } from './home-owner-document.entity';
import { CreateHomeOwnerDocumentDto, UpdateHomeOwnerDocumentDto, UpdateHomeOwnerDocumentStatusDto } from './home-owner-document.dto';
import { HomeOwner } from '../home-owner/home-owner.entity';
import { Status } from '../common/common.type';

@Injectable()
export class HomeOwnerDocumentService {
  constructor(
    @InjectRepository(HomeOwnerDocument, 'agent')
    private readonly homeOwnerDocumentRepository: Repository<HomeOwnerDocument>,
    @InjectRepository(HomeOwner, 'agent')
    private readonly homeOwnerRepository: Repository<HomeOwner>,
  ) { }

  async create(
    createHomeOwnerDocumentDto: CreateHomeOwnerDocumentDto,
  ): Promise<HomeOwnerDocument> {
    const { homeOwnerId, ...rest } = createHomeOwnerDocumentDto;

    if (!homeOwnerId) {
      throw new BadRequestException('homeOwnerId is required');
    }

    const entity = this.homeOwnerDocumentRepository.create({
      homeOwner: { id: homeOwnerId },
      ...rest,
    });

    return this.homeOwnerDocumentRepository.save(entity);
  }

  async findAll(): Promise<HomeOwnerDocument[]> {
    return this.homeOwnerDocumentRepository.find();
  }

  async findAllByHomeOwner(homeOwnerId: number): Promise<HomeOwnerDocument[]> {
    return this.homeOwnerDocumentRepository
      .createQueryBuilder('doc')
      .where('doc.homeOwnerId = :homeOwnerId', { homeOwnerId })
      .getMany();
  }

  async findAllByUser(userId: number): Promise<HomeOwnerDocument[]> {
    return await this.homeOwnerDocumentRepository
      .createQueryBuilder()
      .where('user_id = :userId', { userId })
      .getMany();
  }

  findOne(id: number): Promise<HomeOwnerDocument> {
    return this.homeOwnerDocumentRepository.findOneBy({ id });
  }

  async updateOne(
    id: number,
    updateDto: UpdateHomeOwnerDocumentDto,
  ): Promise<HomeOwnerDocument> {
    const homeOwnerDocument = await this.homeOwnerDocumentRepository.findOne({
      where: { id },
      relations: { homeOwner: true },
    });

    if (!homeOwnerDocument) {
      throw new NotFoundException(
        `${HomeOwnerDocument.name} with ID ${id} not found`,
      );
    }

    this.homeOwnerDocumentRepository.merge(homeOwnerDocument, {
      ...updateDto,
      status: DocumentStatus.PENDING,
    });

    const homeOwnerId = homeOwnerDocument.homeOwnerId;
    // Return home owner to pending if document is reuploaded
    const homeOwner = await this.homeOwnerRepository.findOneBy({ id: homeOwnerId });
    if (homeOwner && homeOwner.status !== Status.PENDING) {
      this.homeOwnerRepository.merge(homeOwner, { status: Status.PENDING });
      await this.homeOwnerRepository.save(homeOwner);
    }

    return this.homeOwnerDocumentRepository.save(homeOwnerDocument);
  }

  async remove(id: number): Promise<void> {
    const document = await this.homeOwnerDocumentRepository.findOneBy({ id });

    await this.homeOwnerDocumentRepository.delete(document.id);
  }

  async updateStatus(
    id: number,
    updateDto: UpdateHomeOwnerDocumentStatusDto,
  ): Promise<HomeOwnerDocument> {
    if (
      updateDto.status === DocumentStatus.DECLINED &&
      !updateDto.declineReason
    ) {
      throw new BadRequestException(ErrorMessage.NO_REASON_DECLINE);
    }

    if (updateDto.status !== DocumentStatus.DECLINED) {
      updateDto.declineReason = null
    }

    const homeOwnerDocument = await this.homeOwnerDocumentRepository.findOneBy({
      id,
    });

    if (!homeOwnerDocument) {
      throw new NotFoundException(
        `${HomeOwnerDocument.name} with ID ${id} not found`,
      );
    }

    const { reviewerId, ...rest } = updateDto;

    this.homeOwnerDocumentRepository.merge(homeOwnerDocument, {
      ...rest,
      reviewer: { id: reviewerId },
      reviewedAt: new Date().toISOString(),
    });
    return this.homeOwnerDocumentRepository.save(homeOwnerDocument);
  }

  async reupload(
    id: number,
    dto: UpdateHomeOwnerDocumentDto,
  ): Promise<HomeOwnerDocument> {
    return await this.updateOne(id, dto);
  }
}
