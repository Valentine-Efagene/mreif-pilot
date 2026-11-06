import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Patch,
  UsePipes,
  ValidationPipe,
  HttpStatus,
  ParseIntPipe,
  HttpCode,
  BadRequestException,
  Req,
} from '@nestjs/common';
import { Rsa } from './rsa.entity';
import { RsaService } from './rsa.service';
import {
  CreateRsaDto,
  UpdateRsaDto,
  UpdateRsaStatusDto,
} from './rsa.dto';
import { Paginate, PaginateQuery, Paginated } from 'nestjs-paginate';
import {
  ApiHeader,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import OpenApiHelper from '../common/OpenApiHelper';
import { StandardApiResponse } from '../common/common.dto';
import { ErrorMessage, ResponseMessage } from '../common/common.enum';
import { SwaggerAuth } from '../common/guard/swagger-auth.guard';
import { RsaDocument } from '../rsa-document/rsa-document.entity';
import { RsaStatus } from './rsa.enums';

@SwaggerAuth()
@Controller('rsas')
@ApiTags('RSA Applications')
@ApiResponse(OpenApiHelper.responseDoc)
export class RsaController {
  constructor(
    private readonly rsaService: RsaService,
  ) { }

  @ApiHeader(OpenApiHelper.userIdHeader)
  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(
    @Body() createRsaDto: CreateRsaDto,
    @Req() request
  ): Promise<StandardApiResponse<Rsa>> {
    const data = await this.rsaService.create(createRsaDto, request);
    return new StandardApiResponse(HttpStatus.CREATED, ResponseMessage.CREATED, data);
  }

  @ApiHeader(OpenApiHelper.userIdHeader)
  @Get()
  async findAll(): Promise<StandardApiResponse<Rsa[]>> {
    const data = await this.rsaService.findAll();
    return new StandardApiResponse(HttpStatus.OK, ResponseMessage.FETCHED, data);
  }

  @ApiHeader(OpenApiHelper.userIdHeader)
  @Get('paginate')
  @ApiResponse(OpenApiHelper.paginatedResponseDoc)
  @ApiOperation({
    summary: 'Get all rsas',
    tags: ['Admin'],
    description: 'Paginated Response',
  })
  public async findAllPaginated(
    @Paginate() query: PaginateQuery,
  ): Promise<StandardApiResponse<Paginated<Rsa>>> {
    const data = await this.rsaService.findAllPaginated(query);
    return new StandardApiResponse(HttpStatus.OK, ResponseMessage.FETCHED, data);
  }

  @ApiHeader(OpenApiHelper.userIdHeader)
  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<StandardApiResponse<Rsa>> {
    const data = await this.rsaService.findOne(id);
    return new StandardApiResponse(HttpStatus.OK, ResponseMessage.FETCHED, data);
  }

  @ApiHeader(OpenApiHelper.userIdHeader)
  @Get(':id/documents')
  async findDocuments(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<StandardApiResponse<RsaDocument[]>> {
    const data = await this.rsaService.findDocuments(id);
    return new StandardApiResponse(HttpStatus.OK, ResponseMessage.FETCHED, data);
  }

  @ApiHeader(OpenApiHelper.userIdHeader)
  @Get('by-mortgage/:id')
  async getRsaByMortgageId(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<StandardApiResponse<Rsa>> {
    const data = await this.rsaService.findOneByMortgageId(id);
    return new StandardApiResponse(HttpStatus.OK, ResponseMessage.UPDATED, data);
  }

  @ApiHeader(OpenApiHelper.userIdHeader)
  @Patch(':id')
  async updateRsa(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateRsaDto,
  ): Promise<StandardApiResponse<Rsa>> {
    const data = await this.rsaService.updateOne(id, updateDto);
    return new StandardApiResponse(HttpStatus.OK, ResponseMessage.UPDATED, data);
  }

  @HttpCode(HttpStatus.OK)
  @Post(':id/update-status')
  @ApiOperation({ summary: '', tags: ['Admin'] })
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateRsaStatusDto,
    @Req() request
  ): Promise<StandardApiResponse<Rsa>> {
    if (updateDto.status === RsaStatus.DECLINED && (!updateDto.comment || updateDto.comment.length < 1)) {
      throw new BadRequestException(ErrorMessage.NO_COMMENT_DECLINE)
    }

    if (updateDto.status != RsaStatus.DECLINED) {
      updateDto.comment = null
    }

    const data = await this.rsaService.updateStatus(
      id,
      updateDto,
      request
    );

    return new StandardApiResponse(HttpStatus.OK, ResponseMessage.UPDATED, data);
  }

  @ApiHeader(OpenApiHelper.userIdHeader)
  @Delete(':id')
  @ApiOperation({ summary: '', tags: ['Admin'] })
  async remove(
    @Param('id', ParseIntPipe) id: number): Promise<StandardApiResponse<void>> {
    await this.rsaService.remove(id);
    return new StandardApiResponse(HttpStatus.OK, ResponseMessage.DELETED, null);
  }
}
