import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeveloperDirector } from './developer-director.entity';
import {
  CreateDeveloperDirectorDto,
  CreateManyDeveloperDirectorsDto,
  UpdateDeveloperDirectorDto,
} from './developer-director.dto';
import DateHelper from '../common/helpers/DateHelper';

@Injectable()
export class DeveloperDirectorService {
  constructor(
    @InjectRepository(DeveloperDirector, 'developer')
    private readonly developerDirectorRepository: Repository<DeveloperDirector>,
  ) { }

  async create(
    createDeveloperDirectorDto: CreateDeveloperDirectorDto,
  ): Promise<DeveloperDirector> {
    const { dateOfBirth, ...rest } = createDeveloperDirectorDto;

    const entity = this.developerDirectorRepository.create({
      dateOfBirth: DateHelper.formatDateToYYYYMMDD(dateOfBirth),
      ...rest,
    });
    return await this.developerDirectorRepository.save(entity);
  }

  async findAll(): Promise<DeveloperDirector[]> {
    return this.developerDirectorRepository.find();
  }

  async findAllByDeveloperId(
    developerId: number,
  ): Promise<DeveloperDirector[]> {
    return this.developerDirectorRepository
      .createQueryBuilder()
      .where('developer_id = :developerId', { developerId })
      .getMany();
  }

  findOne(id: number): Promise<DeveloperDirector> {
    return this.developerDirectorRepository.findOneBy({ id: id });
  }

  async updateOne(
    id: number,
    updateDeveloperDto: UpdateDeveloperDirectorDto,
  ): Promise<DeveloperDirector> {
    const developer = await this.developerDirectorRepository.findOneBy({ id });

    if (!developer) {
      throw new NotFoundException(
        `${DeveloperDirector.name} with ID ${id} not found`,
      );
    }

    this.developerDirectorRepository.merge(developer, updateDeveloperDto);
    return this.developerDirectorRepository.save(developer);
  }

  async deleteByDeveloperId(developerId: number): Promise<void> {
    await this.developerDirectorRepository
      .createQueryBuilder()
      .delete()
      .from(DeveloperDirector)
      .where('developer_id = :developerId', { developerId })
      .execute();
  }

  async createMany(
    createDeveloperDirectorsDto: CreateManyDeveloperDirectorsDto,
  ): Promise<DeveloperDirector[]> {
    const developerId = createDeveloperDirectorsDto.developerId;

    const dto = createDeveloperDirectorsDto.developerDirectors.map(
      (createDeveloperDirectorDto) => {
        const { dateOfBirth, ...rest } = createDeveloperDirectorDto;

        return {
          developer: { id: developerId },
          dateOfBirth: DateHelper.formatDateToYYYYMMDD(dateOfBirth),
          ...rest,
        };
      },
    );

    return this.developerDirectorRepository.save(dto);
  }

  async remove(id: number): Promise<void> {
    const director = await this.findOne(id);

    // if (director.developerDirectorDocuments?.length > 0) {
    //   director.developerDirectorDocuments.forEach((document) => {
    //     this.developerDirectorDocumentService.remove(document.id);
    //   });
    // }

    await this.developerDirectorRepository.delete(id);
  }
}
