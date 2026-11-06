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
import { SwaggerAuth } from '../common/guard/swagger-auth.guard';
import { StatsService } from './stats.service';
import { ICountsDto } from './stats.dto';

@SwaggerAuth()
@Controller('stats')
@ApiTags('General Statistics')
@ApiHeader(OpenApiHelper.userIdHeader)
@ApiResponse(OpenApiHelper.responseDoc)
export class PmbController {
  constructor(
    private readonly statsService: StatsService,
  ) { }

  @Get()
  async stats(): Promise<StandardApiResponse<ICountsDto>> {
    const data = await this.statsService.getStats();
    return new StandardApiResponse(HttpStatus.CREATED, ResponseMessage.FETCHED, data);
  }
}
