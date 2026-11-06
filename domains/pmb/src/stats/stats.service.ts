import { Injectable } from '@nestjs/common';
import { PmbService } from '../pmb/pmb.service';
import { ICountsDto } from './stats.dto';

// https://www.npmjs.com/package/nestjs-paginate
@Injectable()
export class StatsService {
  constructor(
    private readonly pmbService: PmbService,
  ) { }

  async getStats(): Promise<ICountsDto> {
    const nPmbs = await this.pmbService.getCount();
    return {
      nPmbs,
    }
  }
}
