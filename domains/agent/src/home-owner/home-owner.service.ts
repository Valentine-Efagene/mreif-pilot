import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreateHomeOwnerDto, PaginatedHomeOwners, UpdateHomeOwnerStatusDto } from './home-owner.dto';
import { HomeOwner } from './home-owner.entity';
import { UpdateHomeOwnerDto } from './home-owner.dto';
import {
  PaginateQuery,
  paginate,
  Paginated,
} from 'nestjs-paginate';
import { PaginationArgs } from '../common/common.dto';
import { HomeOwnerDocumentService } from '../home-owner-document/home-owner-document.service';
import { HomeOwnerDocument } from '../home-owner-document/home-owner-document.entity';
import { Status } from '../common/common.type';
import { ErrorMessage } from '../common/common.enum';
import { User } from '../user/user.entity';
import { HomeOwnerPoc } from '../home-owner-poc/home-owner-poc.entity';
import { HomeOwnerPocService } from '../home-owner-poc/home-owner-poc.service';
import { HomeOwnerOnboardingCompleteDto } from '../notification/notification.dto';
import { NotificationService } from '../notification/notification.service';
import { Request } from 'express';
import { App } from '../notification/notification.enums';

// https://www.npmjs.com/package/nestjs-paginate
@Injectable()
export class HomeOwnerService {
  private app: App

  constructor(
    @InjectRepository(HomeOwner, 'agent')
    private readonly homeOwnerRepository: Repository<HomeOwner>,
    private readonly homeOwnerDocumentService: HomeOwnerDocumentService,
    private readonly homeOwnerPocService: HomeOwnerPocService,
    private readonly notificationService: NotificationService,
    private dataSource: DataSource,
  ) { }

  async create(createHomeOwnerDto: CreateHomeOwnerDto, request: Request): Promise<HomeOwner> {
    const { documents, poc, ...rest } = createHomeOwnerDto;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const homeOwner = new HomeOwner({
        ...rest,
        status: Status.APPROVED
      })
      await queryRunner.manager.save(homeOwner)

      const user = await this.dataSource
        .createQueryBuilder()
        .select('user')
        .from(User, 'user')
        .where('user.id = :id', { id: createHomeOwnerDto.userId })
        .getOne();

      if (!user) {
        throw new BadRequestException(`User with ID ${createHomeOwnerDto.userId} not found`);
      }

      const documentSavePromises = [];

      for (const documentDto of documents || []) {
        const document = new HomeOwnerDocument();
        document.name = documentDto.name;
        document.url = documentDto.url;
        document.homeOwnerId = homeOwner.id;
        document.description = documentDto.description;

        documentSavePromises.push(queryRunner.manager.save(document));
      }

      if (poc) {
        const entity = new HomeOwnerPoc();
        Object.assign(entity, {
          ...poc,
          homeOwner: { id: homeOwner.id }
        })
        await queryRunner.manager.save(entity);
      }

      await Promise.all(documentSavePromises);
      await queryRunner.commitTransaction();

      const response: HomeOwner = await this.homeOwnerRepository.findOne({
        where: { id: homeOwner.id },
        relations: ['documents', 'poc'],
      });

      try {
        const emailDto: HomeOwnerOnboardingCompleteDto = {
          firstname: user.firstName,
          app: this.app,
          to_email: user.email,
          loginLink: process.env.AGENT_DASHBOARD_URL,
        };
        await this.notificationService.sendHomeownerOnboardingCompleted(emailDto, request);
      } catch (error) {
        console.log('Error sending notification email:', error);
      }

      return response;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(): Promise<HomeOwner[]> {
    return this.homeOwnerRepository.find();
  }

  async findDocumentsByHomeOwnerId(homeOwnerId: number): Promise<HomeOwnerDocument[]> {
    return this.homeOwnerDocumentService.findAllByHomeOwner(homeOwnerId);
  }

  async findPocByHomeOwnerId(homeOwnerId: number): Promise<HomeOwnerPoc> {
    return this.homeOwnerPocService.findByHomeOwner(homeOwnerId);
  }

  findAllPaginated(query: PaginateQuery): Promise<Paginated<HomeOwner>> {
    return paginate(query, this.homeOwnerRepository, {
      sortableColumns: ['id', 'createdAt', 'updatedAt'],
      defaultSortBy: [['id', 'DESC']],
      searchableColumns: [],
      filterableColumns: {
      },
    });
  }

  async findOne(id: number): Promise<HomeOwner> {
    const homeOwner = this.homeOwnerRepository.findOne({
      where: { id },
      relations: ['documents', 'poc'],
    });

    if (!homeOwner) {
      throw new NotFoundException(`${HomeOwner.name} with ID ${id} not found`);
    }

    return homeOwner;
  }

  async updateStatus(
    id: number,
    updateDto: UpdateHomeOwnerStatusDto,
  ): Promise<HomeOwner> {
    if (
      updateDto.status === Status.DECLINED &&
      !updateDto.comment
    ) {
      throw new BadRequestException(ErrorMessage.NO_REASON_DECLINE);
    }

    if (updateDto.status !== Status.DECLINED) {
      updateDto.comment = null
    }

    const homeOwner = await this.homeOwnerRepository.findOneBy({
      id,
    });

    if (!homeOwner) {
      throw new NotFoundException(
        `${HomeOwner.name} with ID ${id} not found`,
      );
    }

    const { reviewerId, ...rest } = updateDto;

    this.homeOwnerRepository.merge(homeOwner, {
      ...rest,
      reviewer: { id: reviewerId },
      reviewedAt: new Date().toISOString(),
    });
    return this.homeOwnerRepository.save(homeOwner);
  }

  async findOneByUser(id: number): Promise<HomeOwner> {
    const homeOwner = this.homeOwnerRepository.findOne({
      where: {
        user: { id },
      },
      relations: ['documents', 'poc'],
    });
    return homeOwner;
  }

  async updateOne({ id, ...updateHomeOwnerDto }: UpdateHomeOwnerDto): Promise<HomeOwner> {
    const homeOwner = await this.homeOwnerRepository.findOneBy({ id });

    if (!homeOwner) {
      throw new NotFoundException(`HomeOwner with ID ${id} not found`);
    }

    this.homeOwnerRepository.merge(homeOwner, updateHomeOwnerDto);
    return this.homeOwnerRepository.save(homeOwner);
  }

  async remove(id: number): Promise<void> {
    await this.homeOwnerRepository.delete(id);
  }

  async paginate(query: PaginationArgs): Promise<PaginatedHomeOwners> {
    const [data, count] = await this.homeOwnerRepository.findAndCount({
      skip: query.page > 0 ? query.page - 1 : 1,
      take: query.limit,
    });

    return {
      data,
      meta: {
        currentPage: query.page,
        itemsPerPage: query?.limit,
        totalItems: data.length,
        totalPages: Math.ceil(count / query.limit),
      },
    };
  }
}
