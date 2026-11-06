import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HomeOwnerPoc } from './home-owner-poc.entity';
import {
  CreateHomeOwnerPocDto,
  UpdateHomeOwnerPocDto,
} from './home-owner-poc.dto';

@Injectable()
export class HomeOwnerPocService {
  constructor(
    @InjectRepository(HomeOwnerPoc, 'agent')
    private readonly homeOwnerPocRepository: Repository<HomeOwnerPoc>,
  ) { }

  async create(
    createHomeOwnerPocDto: CreateHomeOwnerPocDto,
  ): Promise<HomeOwnerPoc> {
    try {
      const { homeOwnerId, ...rest } = createHomeOwnerPocDto
      const entity = this.homeOwnerPocRepository.create({
        homeOwner: { id: homeOwnerId },
        ...rest
      });

      return await this.homeOwnerPocRepository.save(entity);
    } catch (error) {
      if (!error['code'] || error['code'] !== 'ER_DUP_ENTRY') {
        throw error
      }

      const { homeOwnerId, ...updateDto } = createHomeOwnerPocDto

      const existingPoc = await this.homeOwnerPocRepository.findOneBy({
        homeOwner: { id: homeOwnerId }
      })

      return this.updateOne(existingPoc.id, updateDto)
    }
  }

  async findAll(): Promise<HomeOwnerPoc[]> {
    return this.homeOwnerPocRepository.find();
  }

  findOne(id: number): Promise<HomeOwnerPoc> {
    return this.homeOwnerPocRepository.findOneBy({ id: id });
  }

  findByHomeOwner(id: number): Promise<HomeOwnerPoc> {
    return this.homeOwnerPocRepository.findOneBy({ homeOwnerId: id });
  }

  async updateOne(
    id: number,
    updateDto: UpdateHomeOwnerPocDto,
  ): Promise<HomeOwnerPoc> {
    const homeOwner = await this.homeOwnerPocRepository.findOneBy({ id });

    if (!homeOwner) {
      throw new NotFoundException(
        `${HomeOwnerPoc.name} with ID ${id} not found`,
      );
    }

    this.homeOwnerPocRepository.merge(homeOwner, updateDto);
    return this.homeOwnerPocRepository.save(homeOwner);
  }

  async remove(id: number): Promise<void> {
    await this.homeOwnerPocRepository.delete(id);
  }
}
