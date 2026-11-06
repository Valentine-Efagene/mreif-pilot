import {
  Controller,
  Get,
  Param,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import { Wallet } from './wallet.entity';
import { WalletService } from './wallet.service';
import { ApiHeader, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { StandardApiResponse } from '../common/common.dto';
import OpenApiHelper from '../common/OpenApiHelper';
import { ResponseMessage } from '../common/common.enum';
import { SwaggerAuth } from '@qshelter/nest-auth';
import { Paginate, Paginated, PaginateQuery } from 'nestjs-paginate';

@SwaggerAuth()
@Controller('wallets')
@ApiTags('Wallet')
@ApiResponse(OpenApiHelper.responseDoc)
export class WalletController {
  constructor(private readonly walletService: WalletService) { }

  @Get('paginated')
  //@Roles([Role.ADMIN])
  @ApiHeader(OpenApiHelper.userIdHeader)
  @ApiResponse(OpenApiHelper.paginatedResponseDoc)
  @ApiOperation({
    summary: 'Get all developers',
    tags: ['Admin'],
    description: 'Paginated Response',
  })
  public async findAllPaginated(
    @Paginate() query: PaginateQuery,
  ): Promise<StandardApiResponse<Paginated<Wallet>>> {
    const data = await this.walletService.findAllPaginated(query);
    return new StandardApiResponse(HttpStatus.OK, ResponseMessage.FETCHED, data);
  }

  @Get(':id')
  @ApiHeader(OpenApiHelper.userIdHeader)
  @ApiResponse(OpenApiHelper.responseDoc)
  async findOne(
    @Param('id', ParseIntPipe) id: number,): Promise<StandardApiResponse<Wallet>> {
    const data = await this.walletService.findOne(id);
    return new StandardApiResponse(HttpStatus.OK, ResponseMessage.FETCHED, data);
  }

  @Get()
  @ApiHeader(OpenApiHelper.userIdHeader)
  @ApiResponse(OpenApiHelper.arrayResponseDoc)
  async findAll(): Promise<StandardApiResponse<Wallet[]>> {
    const data = await this.walletService.findAll();
    return new StandardApiResponse(HttpStatus.OK, ResponseMessage.FETCHED, data);
  }
}
