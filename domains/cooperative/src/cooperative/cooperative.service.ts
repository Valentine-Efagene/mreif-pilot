import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginatedCooperatives } from './cooperative.type';
import { Cooperative } from './cooperative.entity';
import { AssignAdminDto, CreateCooperativeDto, UpdateCooperativeDto } from './cooperative.dto';
import {
  //FilterOperator,
  //FilterSuffix,
  PaginateQuery,
  paginate,
  Paginated,
} from 'nestjs-paginate';
import { User } from '../user/user.entity';
import UtilHelper from '../common/helpers/UtilHelper';
import { UserService } from '../user/user.service';

// https://www.npmjs.com/package/nestjs-paginate
@Injectable()
export class CooperativeService {
  constructor(
    @InjectRepository(Cooperative, 'cooperative')
    private readonly cooperativeRepository: Repository<Cooperative>,
    @InjectRepository(User, 'cooperative')
    private readonly userRepository: Repository<User>,

    private readonly userService: UserService,
  ) { }

  async create(createCooperativeDto: CreateCooperativeDto): Promise<Cooperative> {
    return this.cooperativeRepository.save(createCooperativeDto);
  }

  async findAll(): Promise<Cooperative[]> {
    return this.cooperativeRepository.find();
  }

  async fetchMembers(id: number): Promise<User[]> {
    const cooperative = await this.cooperativeRepository.findOne({
      where: { id },
    });

    if (!cooperative) {
      throw new NotFoundException(`${Cooperative.name} with ID ${id} not found`);
    }

    return this.userRepository.createQueryBuilder('user')
      .where('user.cooperative_id = :cooperativeId', { cooperativeId: cooperative.id })
      .getMany();
  }

  async getCount(): Promise<number> {
    return this.cooperativeRepository.count();
  }

  async findAllNamesOnly(): Promise<Cooperative[]> {
    return this.cooperativeRepository.find({ select: ['id', 'name'] });
  }

  findOneDeepByUserId(userId: number): Promise<Cooperative> {
    return this.cooperativeRepository.findOne({
      where: { userId },
      relations: ['user'],
    });
  }


  findAllPaginated(query: PaginateQuery): Promise<Paginated<Cooperative>> {
    return paginate(query, this.cooperativeRepository, {
      sortableColumns: ['id', 'createdAt', 'updatedAt'],
      //nullSort: 'last',
      defaultSortBy: [['id', 'DESC']],
      searchableColumns: ['name'],
      //select: ['id'],
      filterableColumns: {
        //name: [FilterOperator.EQ, FilterSuffix.NOT],
        //age: true,
      },
    });
  }

  async findOne(id: number): Promise<Cooperative> {
    const cooperative = this.cooperativeRepository.findOne({
      where: { id },
    });

    if (!cooperative) {
      throw new NotFoundException(`${Cooperative.name} with ID ${id} not found`);
    }

    return cooperative;
  }

  async findOneByUser(id: number): Promise<Cooperative> {
    const user = await this.userRepository.findOneBy({ id })

    return this.cooperativeRepository.createQueryBuilder('cooperative')
      .where('cooperative.id = :cooperativeId', { cooperativeId: user.cooperativeId })
      .getOne();
  }

  async updateOne(
    id: number,
    updateCooperativeDto: UpdateCooperativeDto,
  ): Promise<Cooperative> {
    const cooperative = await this.cooperativeRepository.findOneBy({ id });

    if (!cooperative) {
      throw new NotFoundException(`Cooperative with ID ${id} not found`);
    }

    this.cooperativeRepository.merge(cooperative, updateCooperativeDto);
    return this.cooperativeRepository.save(cooperative);
  }

  async assignAdmin(
    dto: AssignAdminDto,
  ): Promise<Cooperative> {
    const cooperative = await this.cooperativeRepository.findOneBy({ id: dto.cooperativeId });
    const user = await this.userRepository.findOneBy({ id: dto.userId });

    if (!cooperative) {
      throw new NotFoundException(`Cooperative not found`);
    }

    if (!user) {
      throw new NotFoundException(`User not found`);
    }

    if (user.cooperativeId !== cooperative.id) {
      throw new BadRequestException(`User is not a member of the cooperative`);
    }

    this.cooperativeRepository.merge(cooperative, {
      admin: {
        id: dto.userId
      }
    });

    return this.cooperativeRepository.save(cooperative);
  }

  async paginate(page: number = 1, limit: number = 10): Promise<PaginatedCooperatives> {
    const [users, total] = await this.cooperativeRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      total,
      totalPages,
      currentPage: page,
      data: users,
    };
  }

  async remove(id: number): Promise<void> {
    const cooperative = await this.cooperativeRepository.findOneBy({ id });

    if (!cooperative) {
      throw new NotFoundException(`Cooperative with ID ${id} not found`);
    }

    const staffCount = await this.userRepository.count({
      where: {
        cooperativeId: id,
        suspended: false
      }
    });

    if (staffCount > 0) {
      throw new BadRequestException(`Cooperative with ID ${id} has members`);
    }

    const customerCount = await this.userRepository.count({
      where: {
        cooperativeId: id,
        suspended: false
      }
    });

    if (customerCount > 0) {
      throw new BadRequestException(`Cooperative with ID ${id} has customers`);
    }

    await this.cooperativeRepository.softDelete(id);
  }

  async restore(
    id: number
  ): Promise<Cooperative> {
    const cooperative = await this.cooperativeRepository.findOne({
      where: { id },
      withDeleted: true
    });

    if (!cooperative) {
      throw new NotFoundException(`Cooperative with ID ${id} not found`);
    }

    this.cooperativeRepository.merge(cooperative, { deletedAt: null });
    return this.cooperativeRepository.save(cooperative);
  }
}
