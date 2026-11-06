import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UsePipes,
  ValidationPipe,
  HttpStatus,
  ParseIntPipe,
  HttpCode,
  Req,
} from '@nestjs/common';
import { DeveloperDocument } from './developer-document.entity';
import { DeveloperDocumentService } from './developer-document.service';
import { CreateDeveloperDocumentDto } from './developer-document.dto';
import OpenApiHelper from '../common/OpenApiHelper';
import {
  ApiHeader,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  StandardApiResponse,
  UpdateDocumentStatusDto,
} from '../common/common.dto';
import { ResponseMessage } from '../common/common.enum';
import { SwaggerAuth } from '@qshelter/nest-auth';
import { Request } from 'express';

@SwaggerAuth()
@Controller('developer-documents')
@ApiTags('Developer Document')
@ApiHeader(OpenApiHelper.userIdHeader)
@ApiResponse(OpenApiHelper.responseDoc)
export class DeveloperDocumentController {
  constructor(
    private readonly developerDocumentService: DeveloperDocumentService,
  ) { }

  @Post()
  @ApiOperation({
    summary: 'Upload a file',
    description: '',
  })
  async create(
    @Body() createDeveloperDocumentDto: CreateDeveloperDocumentDto,
    @Req() request: Request
  ): Promise<StandardApiResponse<DeveloperDocument>> {
    const data = await this.developerDocumentService.create(createDeveloperDocumentDto, request);
    return new StandardApiResponse(HttpStatus.CREATED, ResponseMessage.CREATED, data);
  }

  @Get()
  @ApiResponse(OpenApiHelper.arrayResponseDoc)
  async findAll(): Promise<StandardApiResponse<DeveloperDocument[]>> {
    const data = await this.developerDocumentService.findAll();
    return new StandardApiResponse(HttpStatus.OK, ResponseMessage.FETCHED, data);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<StandardApiResponse<DeveloperDocument>> {
    const data = await this.developerDocumentService.findOne(id);
    return new StandardApiResponse(HttpStatus.OK, ResponseMessage.FETCHED, data);
  }

  @HttpCode(HttpStatus.OK)
  @Post(':id/update-status')
  //@Roles([Role.ADMIN])
  @ApiOperation({ summary: '', tags: ['Admin'] })
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateDocumentStatusDto,
  ): Promise<StandardApiResponse<DeveloperDocument>> {
    const data = await this.developerDocumentService.updateStatus(
      id,
      updateDto,
    );

    return new StandardApiResponse(HttpStatus.OK, ResponseMessage.UPDATED, data);
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,): Promise<StandardApiResponse<void>> {
    await this.developerDocumentService.remove(id);

    return new StandardApiResponse(HttpStatus.NO_CONTENT, ResponseMessage.DELETED, null);
  }
}
