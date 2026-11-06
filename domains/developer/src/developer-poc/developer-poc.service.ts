import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeveloperPoc } from './developer-poc.entity';
import {
  CreateDeveloperPocDto,
  UpdateDeveloperPocDto,
} from './developer-poc.dto';

@Injectable()
export class DeveloperPocService {
  constructor(
    @InjectRepository(DeveloperPoc, 'developer')
    private readonly developerPocRepository: Repository<DeveloperPoc>,
  ) { }

  async create(
    createDeveloperPocDto: CreateDeveloperPocDto,
  ): Promise<DeveloperPoc> {
    try {
      const { developerId, ...rest } = createDeveloperPocDto
      const entity = this.developerPocRepository.create({
        developer: { id: developerId },
        ...rest
      });

      return await this.developerPocRepository.save(entity);
    } catch (error) {
      if (!error['code'] || error['code'] !== 'ER_DUP_ENTRY') {
        throw error
      }

      const { developerId, ...updateDto } = createDeveloperPocDto

      const existingPoc = await this.developerPocRepository.findOneBy({
        developer: { id: developerId }
      })

      return this.updateOne(existingPoc.id, updateDto)
    }
  }

  async findAll(): Promise<DeveloperPoc[]> {
    return this.developerPocRepository.find();
  }

  findOne(id: number): Promise<DeveloperPoc> {
    return this.developerPocRepository.findOneBy({ id: id });
  }

  async updateOne(
    id: number,
    updateDto: UpdateDeveloperPocDto,
  ): Promise<DeveloperPoc> {
    const developer = await this.developerPocRepository.findOneBy({ id });

    if (!developer) {
      throw new NotFoundException(
        `${DeveloperPoc.name} with ID ${id} not found`,
      );
    }

    this.developerPocRepository.merge(developer, updateDto);
    return this.developerPocRepository.save(developer);
  }

  async remove(id: number): Promise<void> {
    await this.developerPocRepository.delete(id);
  }
}
