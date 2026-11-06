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
import {
  CreateDeveloperDirectorDto,
  CreateManyDeveloperDirectorsDto,
} from './developer-director.dto';
import { DeveloperDirector } from './developer-director.entity';
import { DeveloperDirectorService } from './developer-director.service';
import OpenApiHelper from '../common/OpenApiHelper';
import { ApiHeader, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { StandardApiResponse } from '../common/common.dto';
import { ResponseMessage } from '../common/common.enum';
import { SwaggerAuth } from '@qshelter/nest-auth';

@SwaggerAuth()
@Controller('developer-directors')
@ApiTags('Developer Director')
@ApiHeader(OpenApiHelper.userIdHeader)
@ApiResponse(OpenApiHelper.responseDoc)
export class DeveloperDirectorController {
  constructor(
    private readonly developerDirectorService: DeveloperDirectorService,
  ) { }

  @Post('bulk-create')
  @ApiOperation({
    summary: 'Create multiple developer directors',
    description:
      'Create multiple developer directors with a check for the same developer ID.',
  })
  async createMany(
    @Body()
    createDeveloperDirectorsDto: CreateManyDeveloperDirectorsDto,
  ): Promise<StandardApiResponse<DeveloperDirector[]>> {
    const data = await this.developerDirectorService.createMany(
      createDeveloperDirectorsDto,
    );
    return new StandardApiResponse(HttpStatus.CREATED, ResponseMessage.CREATED, data);
  }

  @Post()
  async create(
    @Body() createUserDto: CreateDeveloperDirectorDto,
  ): Promise<StandardApiResponse<DeveloperDirector>> {
    const data = await this.developerDirectorService.create(createUserDto);
    return new StandardApiResponse(HttpStatus.CREATED, ResponseMessage.CREATED, data);
  }

  @Get()
  @ApiResponse(OpenApiHelper.arrayResponseDoc)
  async findAll(): Promise<StandardApiResponse<DeveloperDirector[]>> {
    const data = await this.developerDirectorService.findAll();
    return new StandardApiResponse(HttpStatus.OK, ResponseMessage.FETCHED, data);
  }

  @Get('by-developer/:id')
  @ApiOperation({
    summary: 'Get all by developer ID',
    description: 'Get all by developer ID',
  })
  @ApiResponse(OpenApiHelper.arrayResponseDoc)
  async findAllByDeveloperId(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<StandardApiResponse<DeveloperDirector[]>> {
    const data = await this.developerDirectorService.findAllByDeveloperId(
      id,
    );
    return new StandardApiResponse(HttpStatus.OK, ResponseMessage.FETCHED, data);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<StandardApiResponse<DeveloperDirector>> {
    const data = await this.developerDirectorService.findOne(id);
    return new StandardApiResponse(HttpStatus.OK, ResponseMessage.FETCHED, data);
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number
  ): Promise<StandardApiResponse<void>> {
    await this.developerDirectorService.remove(id);
    return new StandardApiResponse(HttpStatus.NO_CONTENT, ResponseMessage.DELETED, null);
  }
}
