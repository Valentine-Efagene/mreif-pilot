import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreateLicensingInfoDto } from './licensing-info.dto';
import { LicensingInfo } from './licensing-info.entity';
import { UpdateLicensingInfoDto } from './licensing-info.dto';
import {
  //FilterOperator,
  //FilterSuffix,
  PaginateQuery,
  paginate,
  Paginated,
} from 'nestjs-paginate';
import { LicensingDocument } from '../licensing-document/licensing-document.entity';

// https://www.npmjs.com/package/nestjs-paginate
@Injectable()
export class LicensingInfoService {
  constructor(
    @InjectRepository(LicensingInfo, 'agent')
    private readonly licensingInfoRepository: Repository<LicensingInfo>,
    private dataSource: DataSource,
  ) { }

  async create(dto: CreateLicensingInfoDto): Promise<LicensingInfo> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const licensingInfo = new LicensingInfo();
      licensingInfo.agentId = dto.agentId;
      licensingInfo.regulatoryBody = dto.regulatoryBody;
      const persistedInfo = await queryRunner.manager.save(licensingInfo);

      const document = new LicensingDocument();
      document.name = dto.regulatoryBody;
      document.url = dto.url;
      document.licensingInfoId = persistedInfo.id;
      await queryRunner.manager.save(document);

      await queryRunner.commitTransaction();
      return persistedInfo;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(): Promise<LicensingInfo[]> {
    return this.licensingInfoRepository.find();
  }

  findAllPaginated(query: PaginateQuery): Promise<Paginated<LicensingInfo>> {
    return paginate(query, this.licensingInfoRepository, {
      sortableColumns: ['id', 'createdAt', 'updatedAt'],
      //nullSort: 'last',
      defaultSortBy: [['id', 'DESC']],
      searchableColumns: [],
      //select: ['id'],
      filterableColumns: {
        //name: [FilterOperator.EQ, FilterSuffix.NOT],
        //age: true,
      },
    });
  }

  async findOne(id: number): Promise<LicensingInfo> {
    const licensingInfo = this.licensingInfoRepository.findOne({
      where: { id },
      relations: [
        'proposedDevelopments',
        'user',
        'licensingInfoPoc',
        'licensingInfoDocuments',
        //'licensingInfoDirectors',
        //'groupEntities',
      ],
    });

    if (!licensingInfo) {
      throw new NotFoundException(
        `${LicensingInfo.name} with ID ${id} not found`,
      );
    }

    return licensingInfo;
  }

  async findOneByUser(id: number): Promise<LicensingInfo> {
    const licensingInfo = await this.licensingInfoRepository
      .createQueryBuilder('licensingInfo')
      .innerJoinAndSelect('licensingInfo.agent', 'agent')
      .innerJoinAndSelect('agent.user', 'user')
      .where('user.id = :userId', { userId: id })
      .getOne();

    return licensingInfo;
  }

  async updateOne(
    id: number,
    updateLicensingInfoDto: UpdateLicensingInfoDto & {
      size?: number;
      url?: string;
    },
  ): Promise<LicensingInfo> {
    const licensingInfo = await this.licensingInfoRepository.findOneBy({ id });

    if (!licensingInfo) {
      throw new NotFoundException(`LicensingInfo with ID ${id} not found`);
    }

    this.licensingInfoRepository.merge(licensingInfo, updateLicensingInfoDto);
    return this.licensingInfoRepository.save(licensingInfo);
  }

  async reupload(
    id: number,
    dto: UpdateLicensingInfoDto,
  ): Promise<LicensingInfo> {
    return await this.updateOne(id, dto);
  }

  // async deleteAllChildrenGroupEntities(licensingInfoId: number): Promise<void> {
  //   await this.licensingInfoRepository
  //     .createQueryBuilder()
  //     .delete()
  //     .from(GroupEntity)
  //     .where('licensingInfo_id = :licensingInfoId', { licensingInfoId })
  //     .execute();
  // }

  async remove(id: number): Promise<void> {
    await this.licensingInfoRepository.delete(id);
  }
}
