import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  ParseIntPipe,
  UsePipes,
  ValidationPipe,
  HttpStatus,
  HttpCode,
  Req,
} from '@nestjs/common';
import { ProposedDevelopmentDocument } from './proposed-development-document.entity';
import { ProposedDevelopmentDocumentService } from './proposed-development-document.service';
import { CreateManyProposedDevelopmentDocumentsDto, CreateProposedDevelopmentDocumentDto } from './proposed-development-document.dto';
import {
  ApiHeader,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import OpenApiHelper from '../common/OpenApiHelper';
import {
  DeclineDocumentDto,
  StandardApiResponse,
  UpdateDocumentStatusDto,
} from '../common/common.dto';
import { ResponseMessage } from '../common/common.enum';
import { SwaggerAuth } from '@qshelter/nest-auth';
import { Request } from 'express';

@SwaggerAuth()
@Controller('proposed-development-documents')
@ApiTags('Proposed Development Document')
@ApiHeader(OpenApiHelper.userIdHeader)
@ApiResponse(OpenApiHelper.responseDoc)
export class ProposedDevelopmentDocumentController {
  constructor(
    private readonly proposedDevelopmentDocumentService: ProposedDevelopmentDocumentService,
  ) { }

  @Post('bulk-create')
  @ApiOperation({
    summary: 'Create multiple group entities',
    description:
      'Create multiple group entities with a check for the same developer ID.',
  })
  async createMany(
    @Body()
    dto: CreateManyProposedDevelopmentDocumentsDto,
  ): Promise<StandardApiResponse<ProposedDevelopmentDocument[]>> {
    const data = await this.proposedDevelopmentDocumentService.createMany(
      dto,
    );
    return new StandardApiResponse(HttpStatus.CREATED, ResponseMessage.CREATED, data);
  }

  @Post()
  @ApiOperation({
    summary: 'Upload a file',
    description: '',
  })
  async create(
    @Body()
    createProposedDevelopmentDocumentDto: CreateProposedDevelopmentDocumentDto,
    @Req() request: Request
  ): Promise<StandardApiResponse<ProposedDevelopmentDocument>> {
    try {
      const data = await this.proposedDevelopmentDocumentService.create(createProposedDevelopmentDocumentDto, request);
      return new StandardApiResponse(HttpStatus.CREATED, ResponseMessage.CREATED, data);
    } catch (error) {
      throw error;
    }
  }

  @Get()
  @ApiResponse(OpenApiHelper.arrayResponseDoc)
  async findAll(): Promise<StandardApiResponse<ProposedDevelopmentDocument[]>> {
    const data = await this.proposedDevelopmentDocumentService.findAll();
    return new StandardApiResponse(HttpStatus.OK, ResponseMessage.FETCHED, data);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<StandardApiResponse<ProposedDevelopmentDocument>> {
    const data = await this.proposedDevelopmentDocumentService.findOne(id);
    return new StandardApiResponse(HttpStatus.OK, ResponseMessage.FETCHED, data);
  }

  @Get('/by-proposed-development/:id')
  async findByProposedDevelopment(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<StandardApiResponse<ProposedDevelopmentDocument[]>> {
    const data = await this.proposedDevelopmentDocumentService.findAllByProposedDevelopment(id);
    return new StandardApiResponse(HttpStatus.OK, ResponseMessage.FETCHED, data);
  }

  @HttpCode(HttpStatus.OK)
  @Post(':id/decline')
  //@Roles([Role.ADMIN])
  @ApiOperation({ summary: '', tags: ['Admin'] })
  @UsePipes(new ValidationPipe({ transform: true }))
  async decline(
    @Param('id') id: number,
    @Body() declineDto: DeclineDocumentDto,
  ): Promise<StandardApiResponse<ProposedDevelopmentDocument>> {
    const data = await this.proposedDevelopmentDocumentService.decline(
      id,
      declineDto,
    );
    return new StandardApiResponse(HttpStatus.OK, ResponseMessage.UPDATED, data);
  }

  @HttpCode(HttpStatus.OK)
  @Post(':id/update-status')
  //@Roles([Role.ADMIN])
  @ApiOperation({ summary: '', tags: ['Admin'] })
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateStatus(
    @Param('id') id: number,
    @Body() updateDto: UpdateDocumentStatusDto,
  ): Promise<StandardApiResponse<ProposedDevelopmentDocument>> {
    const data = await this.proposedDevelopmentDocumentService.updateStatus(
      id,
      updateDto,
    );

    return new StandardApiResponse(HttpStatus.OK, ResponseMessage.UPDATED, data);
  }

  @Delete(':id')
  async remove(@Param('id') id: number): Promise<StandardApiResponse<void>> {
    await this.proposedDevelopmentDocumentService.remove(id);
    return new StandardApiResponse(HttpStatus.NO_CONTENT, ResponseMessage.DELETED, null);
  }
}
