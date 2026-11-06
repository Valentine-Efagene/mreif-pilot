import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Patch,
  ValidationPipe,
  UsePipes,
  BadRequestException,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import { GroupEntity } from './group-entity.entity';
import { GroupEntityService } from './group-entity.service';
import {
  CreateGroupEntityDto,
  CreateManyGroupEntitiesDto,
  UpdateGroupEntityDto,
} from './group-entity.dto';
import OpenApiHelper from '../common/OpenApiHelper';
import { ApiHeader, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { StandardApiResponse } from '../common/common.dto';
import { ResponseMessage } from '../common/common.enum';
import { SwaggerAuth } from '@qshelter/nest-auth';

@SwaggerAuth()
@Controller('group-entities')
@ApiTags('Group Entity')
@ApiHeader(OpenApiHelper.userIdHeader)
@ApiResponse(OpenApiHelper.responseDoc)
export class GroupEntityController {
  constructor(
    private readonly groupEntityService: GroupEntityService
  ) { }

  @Post()
  async create(
    @Body() createGroupEntityDto: CreateGroupEntityDto,
  ): Promise<StandardApiResponse<GroupEntity>> {
    const data = await this.groupEntityService.create(createGroupEntityDto);
    return new StandardApiResponse(HttpStatus.CREATED, ResponseMessage.CREATED, data);
  }

  @Post('bulk-create')
  @ApiOperation({
    summary: 'Create multiple group entities',
    description:
      'Create multiple group entities with a check for the same developer ID.',
  })
  async createMany(
    @Body()
    createGroupEntitiesDto: CreateManyGroupEntitiesDto,
  ): Promise<StandardApiResponse<GroupEntity[]>> {
    const data = await this.groupEntityService.createMany(
      createGroupEntitiesDto,
    );
    return new StandardApiResponse(HttpStatus.CREATED, ResponseMessage.CREATED, data);
  }

  @Get()
  @ApiResponse(OpenApiHelper.arrayResponseDoc)
  async findAll(): Promise<StandardApiResponse<GroupEntity[]>> {
    const data = await this.groupEntityService.findAll();
    return new StandardApiResponse(HttpStatus.OK, ResponseMessage.FETCHED, data);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<StandardApiResponse<GroupEntity>> {
    const data = await this.groupEntityService.findOne(id);
    return new StandardApiResponse(HttpStatus.OK, ResponseMessage.FETCHED, data);
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe({ transform: true }))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateGroupEntityDto,
  ): Promise<StandardApiResponse<GroupEntity>> {
    const data = await this.groupEntityService.updateOne(id, updateDto);
    return new StandardApiResponse(HttpStatus.OK, ResponseMessage.UPDATED, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: '', tags: ['Admin'] })
  async remove(
    @Param('id', ParseIntPipe) id: number): Promise<StandardApiResponse<void>> {
    await this.groupEntityService.remove(id);
    return new StandardApiResponse(HttpStatus.NO_CONTENT, ResponseMessage.DELETED, null);
  }
}
