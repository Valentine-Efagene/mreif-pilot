import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto, UpdateUserDto } from './user.dto';
import { IPaginatedUsers } from './user.type';
import { paginate, Paginated, PaginateQuery } from 'nestjs-paginate';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User, 'cooperative')
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

  async updateOne(id: number, updateDto: UpdateUserDto): Promise<User> {
    const employer = await this.userRepository.findOneBy({ id });

    if (!employer) {
      throw new NotFoundException(`${User.name} with ID ${id} not found`);
    }

    this.userRepository.merge(employer, updateDto);
    return this.userRepository.save(employer);
  }

  async paginate(page: number = 1, limit: number = 10): Promise<IPaginatedUsers> {
    const [users, total] = await this.userRepository.findAndCount({
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
    await this.userRepository.delete(id);
  }
}
