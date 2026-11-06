import {
  Controller,
  Get,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiHeader,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import OpenApiHelper from '../common/OpenApiHelper';
import { StandardApiResponse } from '../common/common.dto';
import { ResponseMessage } from '../common/common.enum';
import { SwaggerAuth } from '@qshelter/nest-auth';
import { StatsService } from './stats.service';
import { IStatsDto } from './stats.dto';

@SwaggerAuth()
@Controller('stats')
@ApiTags('General Statistics')
@ApiHeader(OpenApiHelper.userIdHeader)
@ApiResponse(OpenApiHelper.responseDoc)
export class StatsController {
  constructor(
    private readonly statsService: StatsService,
  ) { }

  @Get()
  async stats(): Promise<StandardApiResponse<IStatsDto>> {
    const data = await this.statsService.getStats();
    return new StandardApiResponse(HttpStatus.CREATED, ResponseMessage.FETCHED, data);
  }
}
