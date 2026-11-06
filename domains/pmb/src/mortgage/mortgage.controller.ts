import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import { Mortgage } from './mortgage.entity';
import { MortgageService } from './mortgage.service';
import { CreateMortgageDto } from './mortgage.dto';
import { ApiHeader, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { StandardApiResponse } from '../common/common.dto';
import OpenApiHelper from '../common/OpenApiHelper';
import { ResponseMessage } from '../common/common.enum';
import { SwaggerAuth } from '../common/guard/swagger-auth.guard';

@SwaggerAuth()
@Controller('mortages')
@ApiTags('Mortgage')
@ApiResponse(OpenApiHelper.responseDoc)
export class MortgageController {
  constructor(private readonly mortgageService: MortgageService) { }

  @Post()
  async create(
    @Body() createMortgageDto: CreateMortgageDto,
  ): Promise<StandardApiResponse<Mortgage>> {
    const data = await this.mortgageService.create(createMortgageDto);
    return new StandardApiResponse(HttpStatus.CREATED, ResponseMessage.CREATED, data);
  }

  @Get()
  @ApiHeader(OpenApiHelper.userIdHeader)
  @ApiResponse(OpenApiHelper.arrayResponseDoc)
  async findAll(): Promise<StandardApiResponse<Mortgage[]>> {
    const data = await this.mortgageService.findAll();
    return new StandardApiResponse(HttpStatus.OK, ResponseMessage.FETCHED, data);
  }

  @Get(':id')
  @ApiHeader(OpenApiHelper.userIdHeader)
  @ApiResponse(OpenApiHelper.responseDoc)
  async findOne(
    @Param('id', ParseIntPipe) id: number,): Promise<StandardApiResponse<Mortgage>> {
    const data = await this.mortgageService.findOne(id);
    return new StandardApiResponse(HttpStatus.OK, ResponseMessage.FETCHED, data);
  }

  @Get('/by-pmb/:id')
  @ApiHeader(OpenApiHelper.userIdHeader)
  @ApiResponse(OpenApiHelper.responseDoc)
  async findAllByPmb(
    @Param('id', ParseIntPipe) id: number,): Promise<StandardApiResponse<number>> {
    const data = await this.mortgageService.findAllByPmb(id);
    return new StandardApiResponse(HttpStatus.OK, ResponseMessage.FETCHED, data);
  }

  @Delete(':id')
  @ApiHeader(OpenApiHelper.userIdHeader)
  @ApiOperation({ summary: '', tags: ['Admin'] })
  @ApiResponse(OpenApiHelper.nullResponseDoc)
  async remove(
    @Param('id', ParseIntPipe) id: number): Promise<StandardApiResponse<void>> {
    await this.mortgageService.remove(id);
    return new StandardApiResponse(HttpStatus.NO_CONTENT, ResponseMessage.DELETED, null);
  }
}
