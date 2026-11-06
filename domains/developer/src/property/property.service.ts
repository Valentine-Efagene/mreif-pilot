import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Property } from './property.entity';
import {
  CreatePropertyDto,
  UpdatePropertyDto,
} from './property.dto';

@Injectable()
export class PropertyService {
  constructor(
    @InjectRepository(Property, 'developer')
    private readonly propertyRepository: Repository<Property>,
  ) { }

  async create(
    createPropertyDto: CreatePropertyDto,
  ): Promise<Property> {
    const { projectPropertyId, ...rest } = createPropertyDto;
    return this.propertyRepository.save({
      proposedProperty: { id: projectPropertyId },
      ...rest,
    });
  }

  async findAll(): Promise<Property[]> {
    return this.propertyRepository.find();
  }

  async findAllByDevelopment(id: number): Promise<Property[]> {
    return this.propertyRepository.find({
      where: { projectPropertyId: id }
    });
  }

  findOne(id: number): Promise<Property> {
    return this.propertyRepository.findOneBy({ id: id });
  }

  async updateOne(
    id: number,
    updateDto: UpdatePropertyDto,
  ): Promise<Property> {
    const property = await this.propertyRepository.findOneBy({
      id,
    });

    if (!property) {
      throw new NotFoundException(
        `${Property.name} with ID ${id} not found`,
      );
    }

    this.propertyRepository.merge(property, updateDto);
    return this.propertyRepository.save(property);
  }

  async remove(id: string): Promise<void> {
    await this.propertyRepository.delete(id);
  }
}
