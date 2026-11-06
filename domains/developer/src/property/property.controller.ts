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
import { Property } from './property.entity';
import { PropertyService } from './property.service';
import {
  CreatePropertyDto,
  UpdatePropertyDto,
} from './property.dto';
import { ApiHeader, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { StandardApiResponse } from '../common/common.dto';
import OpenApiHelper from '../common/OpenApiHelper';
import { ResponseMessage } from '../common/common.enum';
import { SwaggerAuth } from '@qshelter/nest-auth';

@SwaggerAuth()
@Controller('properties')
@ApiTags(' Property')
@ApiHeader(OpenApiHelper.userIdHeader)
@ApiResponse(OpenApiHelper.responseDoc)
export class PropertyController {
  constructor(
    private readonly proposedPropertyService: PropertyService,
  ) { }

  @Post()
  async create(
    @Body() createPropertyDto: CreatePropertyDto,
  ): Promise<StandardApiResponse<Property>> {
    const data = await this.proposedPropertyService.create(
      createPropertyDto,
    );
    return new StandardApiResponse(HttpStatus.CREATED, ResponseMessage.CREATED, data);
  }

  @Get()
  @ApiResponse(OpenApiHelper.arrayResponseDoc)
  async findAll(): Promise<StandardApiResponse<Property[]>> {
    const data = await this.proposedPropertyService.findAll();
    return new StandardApiResponse(HttpStatus.OK, ResponseMessage.FETCHED, data);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<StandardApiResponse<Property>> {
    const data = await this.proposedPropertyService.findOne(id);
    return new StandardApiResponse(HttpStatus.OK, ResponseMessage.FETCHED, data);
  }

  @Patch(':id')
  async updateOne(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdatePropertyDto,
  ): Promise<StandardApiResponse<Property>> {
    const data = await this.proposedPropertyService.updateOne(id, updateDto);
    return new StandardApiResponse(HttpStatus.OK, ResponseMessage.UPDATED, data);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<StandardApiResponse<void>> {
    await this.proposedPropertyService.remove(id);
    return new StandardApiResponse(HttpStatus.NO_CONTENT, ResponseMessage.DELETED, null);
  }
}
