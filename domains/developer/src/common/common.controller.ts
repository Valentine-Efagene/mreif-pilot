import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import OpenApiHelper from '../common/OpenApiHelper';
import { DeveloperDocument } from '../developer-document/developer-document.entity';
import { DeveloperDirectorDocument } from '../developer-director-document/developer-director-document.entity';
import { ProposedDevelopmentDocument } from '../proposed-development-document/proposed-development-document.entity';
import { DocumentReuploadDto, StandardApiResponse } from './common.dto';
import { CommonService } from './common.service';
import { ResponseMessage } from './common.enum';
import { FileInterceptor } from '@nestjs/platform-express';
import { AbstractBaseDocumentEntity } from './common.entity';
import { SwaggerAuth } from '@qshelter/nest-auth';

@SwaggerAuth()
@Controller('common')
@ApiTags('Common')
@ApiHeader(OpenApiHelper.userIdHeader)
@ApiResponse(OpenApiHelper.responseDoc)
export class CommonController {
  constructor(private readonly commonService: CommonService) { }

  @Get('all-documents-by-developer/:id')
  async findAllDocumentsByDeveloper(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<
    StandardApiResponse<(
      | DeveloperDocument
      | DeveloperDirectorDocument
      | ProposedDevelopmentDocument
    )[]>
  > {
    const data = await this.commonService.findAllDocumentsByDeveloper(id)
    return new StandardApiResponse(HttpStatus.OK, ResponseMessage.FETCHED, data);
  }

  @Get('all-documents-by-user/:id')
  async findAllDocumentsByUser(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<
    StandardApiResponse<(
      | DeveloperDocument
      | DeveloperDirectorDocument
      | ProposedDevelopmentDocument
    )[]>> {
    const data = await this.commonService.findAllDocumentsByUser(id);
    return new StandardApiResponse(HttpStatus.OK, ResponseMessage.FETCHED, data);
  }

  @HttpCode(HttpStatus.OK)
  @Post('reupload')
  @ApiOperation({
    summary: 'Reupload a file',
    description: ``,
  })
  @UseInterceptors(FileInterceptor('file'))
  async reupload(
    @Body() body: DocumentReuploadDto,
  ): Promise<StandardApiResponse<AbstractBaseDocumentEntity>> {
    const res = await this.commonService.reupload(body)
    return new StandardApiResponse(HttpStatus.OK, ResponseMessage.UPDATED, res);
  }
}


