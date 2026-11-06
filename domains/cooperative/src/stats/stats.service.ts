import { Injectable } from '@nestjs/common';
import { CooperativeService } from '../cooperative/cooperative.service';
import { ICountsDto } from './stats.dto';

// https://www.npmjs.com/package/nestjs-paginate
@Injectable()
export class StatsService {
  constructor(
    private readonly cooperativeService: CooperativeService,
  ) { }

  async getStats(): Promise<ICountsDto> {
    const nCooperatives = await this.cooperativeService.getCount();
    return {
      nCooperatives,
    }
  }
}
