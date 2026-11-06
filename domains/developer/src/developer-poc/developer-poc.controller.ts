import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  ParseIntPipe,
  HttpStatus,
  Patch,
} from '@nestjs/common';
import { CreateDeveloperPocDto, UpdateDeveloperPocDto } from './developer-poc.dto';
import { DeveloperPoc } from './developer-poc.entity';
import { DeveloperPocService } from './developer-poc.service';
import OpenApiHelper from '../common/OpenApiHelper';
import { ApiHeader, ApiResponse, ApiTags } from '@nestjs/swagger';
import { StandardApiResponse } from '../common/common.dto';
import { ResponseMessage } from '../common/common.enum';
import { SwaggerAuth } from '@qshelter/nest-auth';

@SwaggerAuth()
@Controller('developer-pocs')
@ApiTags('Developer Point of Contact')
@ApiHeader(OpenApiHelper.userIdHeader)
@ApiResponse(OpenApiHelper.responseDoc)
export class DeveloperPocController {
  constructor(
    private readonly developerPocService: DeveloperPocService,
  ) { }

  @Post()
  async create(
    @Body() createDto: CreateDeveloperPocDto,
  ): Promise<StandardApiResponse<DeveloperPoc>> {
    const data = await this.developerPocService.create(createDto);
    return new StandardApiResponse(HttpStatus.CREATED, ResponseMessage.CREATED, data);
  }

  @Get()
  async findAll(): Promise<StandardApiResponse<DeveloperPoc[]>> {
    const data = await this.developerPocService.findAll();
    return new StandardApiResponse(HttpStatus.OK, ResponseMessage.FETCHED, data);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<StandardApiResponse<DeveloperPoc>> {
    const data = await this.developerPocService.findOne(id);
    return new StandardApiResponse(HttpStatus.OK, ResponseMessage.FETCHED, data);
  }

  @Patch(':id')
  async updateOne(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateDeveloperPocDto,
  ): Promise<StandardApiResponse<DeveloperPoc>> {
    const data = await this.developerPocService.updateOne(id, updateDto);
    return new StandardApiResponse(HttpStatus.OK, ResponseMessage.UPDATED, data);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<StandardApiResponse<void>> {
    await this.developerPocService.remove(id);
    return new StandardApiResponse(HttpStatus.NO_CONTENT, ResponseMessage.DELETED, null);
  }
}
