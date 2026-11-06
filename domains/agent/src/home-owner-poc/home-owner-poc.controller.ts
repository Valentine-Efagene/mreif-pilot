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
import { CreateHomeOwnerPocDto, UpdateHomeOwnerPocDto } from './home-owner-poc.dto';
import { HomeOwnerPoc } from './home-owner-poc.entity';
import { HomeOwnerPocService } from './home-owner-poc.service';
import OpenApiHelper from '../common/OpenApiHelper';
import { ApiHeader, ApiResponse, ApiTags } from '@nestjs/swagger';
import { StandardApiResponse } from '../common/common.dto';
import { ResponseMessage } from '../common/common.enum';
import { SwaggerAuth } from '@qshelter/nest-auth';

@SwaggerAuth()
@Controller('HomeOwner-pocs')
@ApiTags('HomeOwner Point of Contact')
@ApiHeader(OpenApiHelper.userIdHeader)
@ApiResponse(OpenApiHelper.responseDoc)
export class HomeOwnerPocController {
  constructor(
    private readonly HomeOwnerPocService: HomeOwnerPocService,
  ) { }

  @Post()
  async create(
    @Body() createDto: CreateHomeOwnerPocDto,
  ): Promise<StandardApiResponse<HomeOwnerPoc>> {
    const data = await this.HomeOwnerPocService.create(createDto);
    return new StandardApiResponse(HttpStatus.CREATED, ResponseMessage.CREATED, data);
  }

  @Get()
  async findAll(): Promise<StandardApiResponse<HomeOwnerPoc[]>> {
    const data = await this.HomeOwnerPocService.findAll();
    return new StandardApiResponse(HttpStatus.OK, ResponseMessage.FETCHED, data);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<StandardApiResponse<HomeOwnerPoc>> {
    const data = await this.HomeOwnerPocService.findOne(id);
    return new StandardApiResponse(HttpStatus.OK, ResponseMessage.FETCHED, data);
  }

  @Patch(':id')
  async updateOne(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateHomeOwnerPocDto,
  ): Promise<StandardApiResponse<HomeOwnerPoc>> {
    const data = await this.HomeOwnerPocService.updateOne(id, updateDto);
    return new StandardApiResponse(HttpStatus.OK, ResponseMessage.UPDATED, data);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<StandardApiResponse<void>> {
    await this.HomeOwnerPocService.remove(id);
    return new StandardApiResponse(HttpStatus.NO_CONTENT, ResponseMessage.DELETED, null);
  }
}
