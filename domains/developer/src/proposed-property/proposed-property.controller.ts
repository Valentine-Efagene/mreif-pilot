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
import { ProposedProperty } from './proposed-property.entity';
import { ProposedPropertyService } from './proposed-property.service';
import {
  CreateManyProposedPropertiesDto,
  CreateProposedPropertyDto,
  UpdateProposedPropertyDto,
} from './proposed-property.dto';
import { ApiHeader, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { StandardApiResponse } from '../common/common.dto';
import OpenApiHelper from '../common/OpenApiHelper';
import { ResponseMessage } from '../common/common.enum';
import { SwaggerAuth } from '@qshelter/nest-auth';

@SwaggerAuth()
@Controller('proposed-properties')
@ApiTags('Proposed Property')
@ApiHeader(OpenApiHelper.userIdHeader)
@ApiResponse(OpenApiHelper.responseDoc)
export class ProposedPropertyController {
  constructor(
    private readonly proposedPropertyService: ProposedPropertyService,
  ) { }

  @Post()
  async create(
    @Body() createProposedPropertyDto: CreateProposedPropertyDto,
  ): Promise<StandardApiResponse<ProposedProperty>> {
    const data = await this.proposedPropertyService.create(
      createProposedPropertyDto,
    );
    return new StandardApiResponse(HttpStatus.CREATED, ResponseMessage.CREATED, data);
  }

  @Get()
  @ApiResponse(OpenApiHelper.arrayResponseDoc)
  async findAll(): Promise<StandardApiResponse<ProposedProperty[]>> {
    const data = await this.proposedPropertyService.findAll();
    return new StandardApiResponse(HttpStatus.OK, ResponseMessage.FETCHED, data);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<StandardApiResponse<ProposedProperty>> {
    const data = await this.proposedPropertyService.findOne(id);
    return new StandardApiResponse(HttpStatus.OK, ResponseMessage.FETCHED, data);
  }

  @Get('by-proposed-development/:id')
  async findAllByProposedDevelopment(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<StandardApiResponse<ProposedProperty[]>> {
    const data = await this.proposedPropertyService.findAllByProposedDevelopment(id);
    return new StandardApiResponse(HttpStatus.OK, ResponseMessage.FETCHED, data);
  }

  @Patch(':id')
  async updateOne(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateProposedPropertyDto,
  ): Promise<StandardApiResponse<ProposedProperty>> {
    const data = await this.proposedPropertyService.updateOne(id, updateDto);
    return new StandardApiResponse(HttpStatus.OK, ResponseMessage.UPDATED, data);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<StandardApiResponse<void>> {
    await this.proposedPropertyService.remove(id);
    return new StandardApiResponse(HttpStatus.NO_CONTENT, ResponseMessage.DELETED, null);
  }

  @Post('bulk-create')
  @ApiOperation({
    summary: 'Create multiple properties',
    description:
      'Create multiple properties. Note that the new array replaces the old properties of the project.',
  })
  async createMany(
    @Body()
    createGroupEntitiesDto: CreateManyProposedPropertiesDto,
  ): Promise<StandardApiResponse<ProposedProperty[]>> {
    const data = await this.proposedPropertyService.createMany(
      createGroupEntitiesDto,
    );
    return new StandardApiResponse(HttpStatus.CREATED, ResponseMessage.CREATED, data);
  }
}
