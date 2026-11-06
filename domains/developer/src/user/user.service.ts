import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, JsonContains } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto, UpdateUserDto } from './user.dto';
import { Role } from './user.enums';
import QueryHelper from '../common/helpers/QueryHelper';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User, 'developer')
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
    return this.userRepository.findOneBy({ id: id });
  }

  async updateOne(id: number, updateDto: UpdateUserDto): Promise<User> {
    const developer = await this.userRepository.findOneBy({ id });

    if (!developer) {
      throw new NotFoundException(`${User.name} with ID ${id} not found`);
    }

    this.userRepository.merge(developer, updateDto);
    return this.userRepository.save(developer);
  }

  async remove(id: number): Promise<void> {
    await this.userRepository.delete(id);
  }

  async findAllProjectManagers(): Promise<User[]> {
    const users = await this.userRepository.find({
      where: {
        roles: QueryHelper.JsonArrayContains(Role.PROJECT_MANAGER)
      }
    })

    return users
  }

  async findAllMofiAdmins(): Promise<User[]> {
    const users = await this.userRepository.find({
      where: {
        roles: QueryHelper.JsonArrayContains(Role.MOFI_ADMIN)
      }
    })

    return users
  }
}
