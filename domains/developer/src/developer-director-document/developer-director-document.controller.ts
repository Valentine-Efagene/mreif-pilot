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
  Patch,
  HttpCode,
  Req,
} from '@nestjs/common';
import { DeveloperDirectorDocument } from './developer-director-document.entity';
import { DeveloperDirectorDocumentService } from './developer-director-document.service';
import {
  ApiHeader,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import OpenApiHelper from '../common/OpenApiHelper';
import {
  StandardApiResponse,
  UpdateDocumentStatusDto,
} from '../common/common.dto';
import { ResponseMessage } from '../common/common.enum';
import { SwaggerAuth } from '@qshelter/nest-auth';
import { CreateDeveloperDirectorDocumentDto, UpdateDeveloperDirectorDocumentDto } from './developer-director-document.dto';
import { Request } from 'express';

@SwaggerAuth()
@Controller('developer-director-documents')
@ApiTags('Developer Director Document')
@ApiHeader(OpenApiHelper.userIdHeader)
@ApiResponse(OpenApiHelper.responseDoc)
export class DeveloperDirectorDocumentController {
  constructor(
    private readonly developerDirectorDocumentService: DeveloperDirectorDocumentService,
  ) { }

  @Post()
  @ApiOperation({
    summary: 'Upload a file',
    description: '',
  })
  async create(
    @Body()
    createDeveloperDirectorDocumentDto: CreateDeveloperDirectorDocumentDto,
    @Req() request: Request
  ): Promise<StandardApiResponse<DeveloperDirectorDocument>> {
    const data = await this.developerDirectorDocumentService.create(createDeveloperDirectorDocumentDto, request);
    return new StandardApiResponse(HttpStatus.CREATED, ResponseMessage.CREATED, data);
  }

  @Get()
  @ApiResponse(OpenApiHelper.arrayResponseDoc)
  async findAll(): Promise<StandardApiResponse<DeveloperDirectorDocument[]>> {
    const data = await this.developerDirectorDocumentService.findAll();
    return new StandardApiResponse(HttpStatus.OK, ResponseMessage.FETCHED, data);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<StandardApiResponse<DeveloperDirectorDocument>> {
    const data = await this.developerDirectorDocumentService.findOne(id);
    return new StandardApiResponse(HttpStatus.OK, ResponseMessage.FETCHED, data);
  }

  @Patch(':id')
  //@Roles([Role.ADMIN])
  @ApiOperation({ summary: '', tags: ['Admin'] })
  @UsePipes(new ValidationPipe({ transform: true }))
  async decline(
    @Param('id') id: number,
    @Body() dto: UpdateDeveloperDirectorDocumentDto,
  ): Promise<StandardApiResponse<DeveloperDirectorDocument>> {
    const data = await this.developerDirectorDocumentService.updateOne(
      id,
      dto,
    );
    return new StandardApiResponse(HttpStatus.OK, ResponseMessage.UPDATED, data);
  }

  // @Patch(':id/decline')
  // //@Roles([Role.ADMIN])
  // @ApiOperation({ summary: '', tags: ['Admin'] })
  // @UsePipes(new ValidationPipe({ transform: true }))
  // async decline(
  //   @Param('id') id: number,
  //   @Body() declineDto: DeclineDocumentDto,
  // ): Promise<StandardApiResponse<DeveloperDirectorDocument>> {
  //   const data = await this.developerDirectorDocumentService.decline(
  //     id,
  //     declineDto,
  //   );
  //   return new StandardApiResponse(HttpStatus.OK, ResponseMessage.UPDATED, data);
  // }


  @HttpCode(HttpStatus.OK)
  @Post(':id/update-status')
  //@Roles([Role.ADMIN])
  @ApiOperation({ summary: '', tags: ['Admin'] })
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateStatus(
    @Param('id') id: number,
    @Body() updateDto: UpdateDocumentStatusDto,
  ): Promise<StandardApiResponse<DeveloperDirectorDocument>> {
    const data = await this.developerDirectorDocumentService.updateStatus(
      id,
      updateDto,
    );
    return new StandardApiResponse(HttpStatus.OK, ResponseMessage.UPDATED, data);
  }

  @Delete(':id')
  async remove(@Param('id') id: number): Promise<StandardApiResponse<void>> {
    const data = await this.developerDirectorDocumentService.remove(id);
    return new StandardApiResponse(HttpStatus.OK, ResponseMessage.DELETED, data);
  }
}
