import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto, PaginatedUsers, UpdateUserDto } from './user.dto';
import { PaginationArgs } from '../common/common.dto';
import { paginate, Paginated, PaginateQuery } from 'nestjs-paginate';
import { ReferreePaginationDto } from '../agent/agent.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User, 'agent')
    private readonly userRepository: Repository<User>,
  ) { }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const entity = this.userRepository.create(createUserDto);
    return await this.userRepository.save(entity);
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  findOne(id: number): Promise<User> {
    return this.userRepository.findOneBy({ id });
  }

  findAllPaginated(query: PaginateQuery): Promise<Paginated<User>> {
    return paginate(query, this.userRepository, {
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

  async agentReferrees(agentId: number): Promise<User[]> {
    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .leftJoin('user.referral', 'referral')
      .leftJoin('referral.commissions', 'commission')
      .addSelect('SUM(commission.amount)', 'totalCommission')
      .where('referral.referrerId = :agentId', { agentId })
      .groupBy('user.id');

    return queryBuilder.getMany()
  }

  async paginateAgentReferrees(query: ReferreePaginationDto, agentId: number): Promise<PaginatedUsers> {
    const { page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .leftJoin('user.referral', 'referral')
      .leftJoin('referral.commissions', 'commission')
      .select([
        'user.id',   // Select specific fields from the user entity
        'user.firstName',
        'user.lastName',
        'user.email',
        'user.createdAt'
      ])
      .addSelect('SUM(commission.amount)', 'totalCommission')  // Add the total commission calculation
      .where('referral.referrerId = :agentId', { agentId })
      .groupBy('user.id')  // Group by user to calculate total commission per user
      .orderBy('user.createdAt', 'DESC')  // Apply sorting

    const { entities, raw } = await queryBuilder
      .limit(limit)
      .offset(skip)
      .getRawAndEntities()

    const totalItems = await queryBuilder.getCount()

    // Map the raw result to include the totalCommission
    const mappedResult = entities.map((user: any, index) => {
      return {
        ...user,
        totalCommission: parseFloat((raw?.[index] as any)?.totalCommission || 0),  // Ensure totalCommission is included
      }
    });

    const response = {
      data: mappedResult,
      meta: {
        itemsPerPage: query.limit,
        totalItems,
        currentPage: query.page,
        totalPages: Math.ceil(totalItems / limit)
      }
    }

    return response
  }

  async updateOne(id: number, updateDto: UpdateUserDto): Promise<User> {
    const developer = await this.userRepository.findOneBy({ id });

    if (!developer) {
      throw new NotFoundException(`${User.name} with ID ${id} not found`);
    }

    this.userRepository.merge(developer, updateDto);
    return this.userRepository.save(developer);
  }

  async paginate(query: PaginationArgs): Promise<PaginatedUsers> {
    const [data, count] = await this.userRepository.findAndCount({
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

  async remove(id: number): Promise<void> {
    await this.userRepository.delete(id);
  }
}
