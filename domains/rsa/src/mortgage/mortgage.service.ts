import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Mortgage } from './mortgage.entity';
import { CreateMortgageDto, UpdateMortgageDto } from './mortgage.dto';
import { IPaginatedMortgages } from './mortgage.type';

@Injectable()
export class MortgageService {
  constructor(
    @InjectRepository(Mortgage, 'rsa')
    private readonly mortgageRepository: Repository<Mortgage>,
  ) { }

  async create(createMortgageDto: CreateMortgageDto): Promise<Mortgage> {
    const entity = this.mortgageRepository.create(createMortgageDto);
    return await this.mortgageRepository.save(entity);
  }

  async findAll(): Promise<Mortgage[]> {
    return this.mortgageRepository.find();
  }

  findOne(id: number): Promise<Mortgage> {
    return this.mortgageRepository.findOneBy({ id });
  }

  findOneWithUser(id: number): Promise<Mortgage> {
    return this.mortgageRepository.findOne({
      where: { id },
      relations: ['user']
    });
  }

  async updateOne(id: number, updateDto: UpdateMortgageDto): Promise<Mortgage> {
    const employer = await this.mortgageRepository.findOneBy({ id });

    if (!employer) {
      throw new NotFoundException(`${Mortgage.name} with ID ${id} not found`);
    }

    this.mortgageRepository.merge(employer, updateDto);
    return this.mortgageRepository.save(employer);
  }

  async paginate(page: number = 1, limit: number = 10): Promise<IPaginatedMortgages> {
    const [mortgages, total] = await this.mortgageRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      total,
      totalPages,
      currentPage: page,
      data: mortgages,
    };
  }

  async remove(id: number): Promise<void> {
    await this.mortgageRepository.delete(id);
  }
}
