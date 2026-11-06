import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  HttpStatus,
  ParseIntPipe,
  Patch,
  BadRequestException,
  Delete,
} from '@nestjs/common';
import { Commission } from './commission.entity';
import { CommissionService } from './commission.service';
import { PostCommissionWithCodeDto, UpdateCommissionDto } from './commission.dto';
import { ApiHeader, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ErrorMessage, ResponseMessage } from '../common/common.enum';
import { SwaggerAuth } from '../common/guard/swagger-auth.guard';
import OpenApiHelper from '../common/OpenApiHelper';
import { StandardApiResponse } from '../common/common.dto';
import { Paginate, Paginated, PaginateQuery } from 'nestjs-paginate';
import { CommissionStatus } from './commission.enums';

@SwaggerAuth()
@Controller('commissions')
@ApiTags('Commission')
@ApiResponse(OpenApiHelper.responseDoc)
export class CommissionController {
  constructor(private readonly commissionService: CommissionService) { }

  // @Post()
  // async create(
  //   @Body() createCommissionDto: CreateCommissionDto,
  // ): Promise<StandardApiResponse<Commission>> {
  //   const data = await this.commissionService.create(createCommissionDto);
  //   return new StandardApiResponse(
  //     HttpStatus.CREATED,
  //     ResponseMessage.CREATED,
  //     data,
  //   );
  // }

  @Post()
  async create(
    @Body() createCommissionDto: PostCommissionWithCodeDto,
  ): Promise<StandardApiResponse<Commission>> {
    const data = await this.commissionService.postCommissionWithCode(createCommissionDto);
    return new StandardApiResponse(
      HttpStatus.CREATED,
      ResponseMessage.CREATED,
      data,
    );
  }

  // @Get()
  // @ApiHeader(OpenApiHelper.userIdHeader)
  // @ApiResponse(OpenApiHelper.arrayResponseDoc)
  // async findAll(): Promise<StandardApiResponse<Commission[]>> {
  //   const data = await this.commissionService.findAll();
  //   return new StandardApiResponse(HttpStatus.OK, ResponseMessage.FETCHED, data);
  // }

  @Get('paginate')
  @ApiHeader(OpenApiHelper.userIdHeader)
  @ApiResponse(OpenApiHelper.arrayResponseDoc)
  async findAllPaginated(
    @Paginate() query: PaginateQuery,
  ): Promise<StandardApiResponse<Paginated<Commission>>> {
    const data = await this.commissionService.findAllPaginated(query);
    return new StandardApiResponse(
      HttpStatus.OK,
      ResponseMessage.FETCHED,
      data,
    );
  }

  @Get(':id')
  @ApiHeader(OpenApiHelper.userIdHeader)
  @ApiResponse(OpenApiHelper.responseDoc)
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<StandardApiResponse<Commission>> {
    const data = await this.commissionService.findOne(id);
    return new StandardApiResponse(
      HttpStatus.OK,
      ResponseMessage.FETCHED,
      data,
    );
  }

  @Patch(':id')
  @ApiHeader(OpenApiHelper.userIdHeader)
  @ApiResponse(OpenApiHelper.responseDoc)
  async updateOne(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCommissionDto
  ): Promise<StandardApiResponse<Commission>> {
    if (dto.status && dto.status === CommissionStatus.DECLINED && (!dto.comment || dto.comment.length < 1)) {
      throw new BadRequestException(ErrorMessage.NO_COMMENT_DECLINE)
    }

    if (dto.status && dto.status !== CommissionStatus.DECLINED) {
      dto.comment = null
    }

    const data = await this.commissionService.updateOne(id, dto);
    return new StandardApiResponse(HttpStatus.OK, ResponseMessage.FETCHED, data);
  }

  @Delete(':id')
  @ApiHeader(OpenApiHelper.userIdHeader)
  //@Roles([CommissionRole.ADMIN])
  @ApiOperation({ summary: '', tags: ['Admin'] })
  @ApiResponse(OpenApiHelper.nullResponseDoc)
  async remove(
    @Param('id', ParseIntPipe) id: number): Promise<StandardApiResponse<void>> {
    await this.commissionService.remove(id);
    return new StandardApiResponse(HttpStatus.NO_CONTENT, ResponseMessage.DELETED, null);
  }
}
