import { Injectable } from '@nestjs/common';
import { RsaService } from '../rsa/rsa.service';
import { ICountsDto } from './stats.dto';

// https://www.npmjs.com/package/nestjs-paginate
@Injectable()
export class StatsService {
  constructor(
    private readonly rsaService: RsaService,
  ) { }

  async getStats(): Promise<ICountsDto> {
    const nRsas = await this.rsaService.getCount();
    return {
      nRsas,
    }
  }
}
