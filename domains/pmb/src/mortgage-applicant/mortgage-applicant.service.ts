import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MortgageApplicant } from './mortgage-applicant.entity';
import { CreateMortgageDto, UpdateMortgageDto } from './mortgage-applicant.dto';
import { IPaginatedMortgageApplicants } from './mortgage-applicant.type';

@Injectable()
export class MortgageApplicantService {
  constructor(
    @InjectRepository(MortgageApplicant, 'pmb')
    private readonly mortgageApplicantRepository: Repository<MortgageApplicant>,
  ) { }

  async create(createMortgageDto: CreateMortgageDto): Promise<MortgageApplicant> {
    const entity = this.mortgageApplicantRepository.create(createMortgageDto);
    return await this.mortgageApplicantRepository.save(entity);
  }

  async findAll(): Promise<MortgageApplicant[]> {
    return this.mortgageApplicantRepository.find();
  }

  findOne(id: number): Promise<MortgageApplicant> {
    return this.mortgageApplicantRepository.findOneBy({ id });
  }

  findOneWithUser(id: number): Promise<MortgageApplicant> {
    return this.mortgageApplicantRepository.findOne({
      where: { id },
      relations: ['user']
    });
  }

  async updateOne(id: number, updateDto: UpdateMortgageDto): Promise<MortgageApplicant> {
    const employer = await this.mortgageApplicantRepository.findOneBy({ id });

    if (!employer) {
      throw new NotFoundException(`${MortgageApplicant.name} with ID ${id} not found`);
    }

    this.mortgageApplicantRepository.merge(employer, updateDto);
    return this.mortgageApplicantRepository.save(employer);
  }

  async paginate(page: number = 1, limit: number = 10): Promise<IPaginatedMortgageApplicants> {
    const [mortgages, total] = await this.mortgageApplicantRepository.findAndCount({
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
    await this.mortgageApplicantRepository.delete(id);
  }
}
