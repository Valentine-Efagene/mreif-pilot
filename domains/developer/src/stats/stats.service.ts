import { Injectable } from '@nestjs/common';
import { ProposedDevelopmentService } from '../proposed-development/proposed-development.service';
import { IStatsDto } from './stats.dto';

// https://www.npmjs.com/package/nestjs-paginate
@Injectable()
export class StatsService {
  constructor(
    private readonly proposedDevelopmentService: ProposedDevelopmentService,
  ) { }

  async getStats(): Promise<IStatsDto> {
    const totalGdv = await this.proposedDevelopmentService.getTotalGdv();
    return {
      totalGdv,
    }
  }
}
