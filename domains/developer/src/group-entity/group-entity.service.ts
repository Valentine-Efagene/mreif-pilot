import { Injectable, NotFoundException } from '@nestjs/common';
import { GroupEntity } from './group-entity.entity';
import { GroupEntityRepository } from './group-entity.repository';
import {
  CreateGroupEntityDto,
  CreateManyGroupEntitiesDto,
  UpdateGroupEntityDto,
} from './group-entity.dto';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class GroupEntityService {
  constructor(
    @InjectRepository(GroupEntity, 'developer')
    private readonly groupEntityRepository: GroupEntityRepository,
  ) { }

  create(createGroupEntityDto: CreateGroupEntityDto): Promise<GroupEntity> {
    const { developerId, ...rest } = createGroupEntityDto;
    return this.groupEntityRepository.save({
      developer: { id: developerId },
      ...rest,
    });
  }

  async bulkDelete(ids: number[]): Promise<void> {
    await this.groupEntityRepository
      .createQueryBuilder()
      .delete()
      .from(GroupEntity)
      .whereInIds(ids)
      .execute();
  }

  async deleteByDeveloperId(developerId: number): Promise<void> {
    await this.groupEntityRepository
      .createQueryBuilder()
      .delete()
      .from(GroupEntity)
      .where('developer_id = :developerId', { developerId })
      .execute();
  }

  async createMany(
    createGroupEntitiesDto: CreateManyGroupEntitiesDto,
  ): Promise<GroupEntity[]> {
    const developerId = createGroupEntitiesDto.developerId;
    await this.deleteByDeveloperId(developerId);

    const dto = createGroupEntitiesDto.groupEntities.map(
      (createGroupEntityDto) => {
        return {
          developer: { id: developerId },
          ...createGroupEntityDto,
        };
      },
    );

    return this.groupEntityRepository.save(dto);
  }

  async findAll(): Promise<GroupEntity[]> {
    return this.groupEntityRepository.find();
  }

  findOne(id: number): Promise<GroupEntity> {
    return this.groupEntityRepository.findOneBy({ id: id });
  }

  async updateOne(
    id: number,
    updateDto: UpdateGroupEntityDto,
  ): Promise<GroupEntity> {
    const groupEntity = await this.groupEntityRepository.findOneBy({
      id,
    });

    if (!groupEntity) {
      throw new NotFoundException(
        `${GroupEntity.name} with ID ${id} not found`,
      );
    }

    this.groupEntityRepository.merge(groupEntity, updateDto);
    return this.groupEntityRepository.save(updateDto);
  }

  async remove(id: number): Promise<void> {
    await this.groupEntityRepository.delete(id);
  }
}
