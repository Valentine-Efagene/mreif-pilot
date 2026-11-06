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
  Patch,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { RsaDocument } from './rsa-document.entity';
import { RsaDocumentService } from './rsa-document.service';
import { CreateRsaDocumentDto, UpdateRsaDocumentDto } from './rsa-document.dto';
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
import { DocumentStatus, ErrorMessage, ResponseMessage } from '../common/common.enum';
import { SwaggerAuth } from '../common/guard/swagger-auth.guard';
import { S3UploaderService } from '../s3-uploader/s3-uploader.service';

@SwaggerAuth()
@Controller('rsa-documents')
@ApiTags('Rsa Document')
@ApiHeader(OpenApiHelper.userIdHeader)
@ApiResponse(OpenApiHelper.responseDoc)
export class RsaDocumentController {
  constructor(
    private readonly rsaDocumentService: RsaDocumentService,
    private readonly s3UploaderService: S3UploaderService,
  ) { }

  @HttpCode(HttpStatus.OK)
  @Post(':id/update-status')
  @ApiOperation({ summary: '', tags: ['Admin'] })
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateDocumentStatusDto,
  ): Promise<StandardApiResponse<RsaDocument>> {
    if (updateDto.status === DocumentStatus.DECLINED && (!updateDto.comment || updateDto.comment.length < 1)) {
      throw new BadRequestException(ErrorMessage.NO_COMMENT_DECLINE)
    }

    if (updateDto.status != DocumentStatus.DECLINED) {
      updateDto.comment = null
    }

    const data = await this.rsaDocumentService.updateStatus(
      id,
      updateDto,
    );

    return new StandardApiResponse(HttpStatus.OK, ResponseMessage.UPDATED, data);
  }

  @Post()
  @ApiOperation({
    summary: 'Upload a file',
    description: '',
  })
  async create(
    @Body() createRsaDocumentDto: CreateRsaDocumentDto,
  ): Promise<StandardApiResponse<RsaDocument>> {
    const data = await this.rsaDocumentService.create(createRsaDocumentDto);

    return new StandardApiResponse(HttpStatus.CREATED, ResponseMessage.CREATED, data);
  }

  @Get()
  @ApiResponse(OpenApiHelper.arrayResponseDoc)
  async findAll(): Promise<StandardApiResponse<RsaDocument[]>> {
    const data = await this.rsaDocumentService.findAll();
    return new StandardApiResponse(HttpStatus.OK, ResponseMessage.FETCHED, data);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<StandardApiResponse<RsaDocument>> {
    const data = await this.rsaDocumentService.findOne(id);
    return new StandardApiResponse(HttpStatus.OK, ResponseMessage.FETCHED, data);
  }

  @Patch(':id')
  async updateRsa(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateRsaDocumentDto,
  ): Promise<StandardApiResponse<RsaDocument>> {
    if (updateDto.url) {
      const document = await this.rsaDocumentService.findOne(id)

      try {
        await this.s3UploaderService.deleteFromS3(document.url)
      } catch (error) {
        throw new InternalServerErrorException('Error while deleting document from S3:', error)
      }
    }

    const data = await this.rsaDocumentService.updateOne(id, updateDto);
    return new StandardApiResponse(HttpStatus.OK, ResponseMessage.UPDATED, data);
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,): Promise<StandardApiResponse<void>> {
    const document = await this.rsaDocumentService.findOne(id)
    await this.s3UploaderService.deleteFromS3(document.url)
    await this.rsaDocumentService.remove(id);

    return new StandardApiResponse(HttpStatus.NO_CONTENT, ResponseMessage.DELETED, null);
  }
}
