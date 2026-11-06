import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProposedProperty } from './proposed-property.entity';
import {
  CreateManyProposedPropertiesDto,
  CreateProposedPropertyDto,
  UpdateProposedPropertyDto,
} from './proposed-property.dto';
import { paginate, Paginated, PaginateQuery } from 'nestjs-paginate';

@Injectable()
export class ProposedPropertyService {
  constructor(
    @InjectRepository(ProposedProperty, 'developer')
    private readonly proposedPropertyRepository: Repository<ProposedProperty>,
  ) { }

  async create(
    createProposedPropertyDto: CreateProposedPropertyDto,
  ): Promise<ProposedProperty> {
    const { proposedDevelopmentId, ...rest } = createProposedPropertyDto;
    return this.proposedPropertyRepository.save({
      proposedDevelopment: { id: proposedDevelopmentId },
      ...rest,
    });
  }

  async findAll(): Promise<ProposedProperty[]> {
    return this.proposedPropertyRepository.find();
  }

  findAllByProposedDevelopmentPaginated(
    query: PaginateQuery,
  ): Promise<Paginated<ProposedProperty>> {
    return paginate(query, this.proposedPropertyRepository, {
      sortableColumns: ['id', 'createdAt', 'updatedAt'],
      //nullSort: 'last',
      defaultSortBy: [['id', 'DESC']],
      loadEagerRelations: true,
      relations: ['property'],
      //select: ['id'],
      filterableColumns: {
        //name: [FilterOperator.EQ, FilterSuffix.NOT],
        status: true,
        createdAt: true
      },
    });
  }

  async findAllByProposedDevelopment(id: number): Promise<ProposedProperty[]> {
    return await this.proposedPropertyRepository
      .createQueryBuilder('proposedProperty')
      .leftJoin('proposedProperty.property', 'property')
      .addSelect(['property.status']) // Only select the status field
      .where('proposedProperty.proposedDevelopmentId = :proposedDevelopmentId', { proposedDevelopmentId: id })
      .getMany();
  }

  findOne(id: number): Promise<ProposedProperty> {
    return this.proposedPropertyRepository.findOneBy({ id });
  }

  async updateOne(
    id: number,
    updateDto: UpdateProposedPropertyDto,
  ): Promise<ProposedProperty> {
    const proposedProperty = await this.proposedPropertyRepository.findOneBy({
      id,
    });

    if (!proposedProperty) {
      throw new NotFoundException(
        `${ProposedProperty.name} with ID ${id} not found`,
      );
    }

    this.proposedPropertyRepository.merge(proposedProperty, updateDto);
    return this.proposedPropertyRepository.save(proposedProperty);
  }

  async remove(id: string): Promise<void> {
    await this.proposedPropertyRepository.delete(id);
  }

  async bulkDelete(ids: number[]): Promise<void> {
    await this.proposedPropertyRepository
      .createQueryBuilder()
      .delete()
      .from(ProposedProperty)
      .whereInIds(ids)
      .execute();
  }

  async deleteByProposedDevelopmentId(
    proposedDevelopmentId: number,
  ): Promise<void> {
    await this.proposedPropertyRepository
      .createQueryBuilder()
      .delete()
      .from(ProposedProperty)
      .where('proposed_development_id = :proposedDevelopmentId', {
        proposedDevelopmentId,
      })
      .execute();
  }

  async createMany(
    createManyProposedPropertiesDto: CreateManyProposedPropertiesDto,
  ): Promise<ProposedProperty[]> {
    const proposedDevelopmentId =
      createManyProposedPropertiesDto.proposedDevelopmentId;

    const dto = createManyProposedPropertiesDto.proposedProperties.map(
      (createProposedPropertyDto) => {
        return {
          proposedDevelopment: { id: proposedDevelopmentId },
          ...createProposedPropertyDto,
        };
      },
    );

    return this.proposedPropertyRepository.save(dto);
  }
}
