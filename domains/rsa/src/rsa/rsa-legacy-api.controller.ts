import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Put,
  Req,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DocumentStatus } from '../common/common.type';
import { UpdateDocumentStatusDto } from '../common/common.dto';
import { RsaDocumentService } from '../rsa-document/rsa-document.service';
import { RsaService } from '../rsa/rsa.service';
import { UpdateRsaStatusDto } from '../rsa/rsa.dto';
import { RsaStatus } from '../rsa/rsa.enums';
import { StandardApiResponse } from '../common/common.dto';
import { ResponseMessage } from '../common/common.enum';
import { SwaggerAuth } from '../common/guard/swagger-auth.guard';

/**
 * Legacy admin paths (`PUT /rsa/api/approve|decline/...`) kept for MofixQshelter_admin.
 */
@SwaggerAuth()
@ApiTags('RSA Legacy Admin API')
@Controller('api')
export class RsaLegacyApiController {
  constructor(
    private readonly rsaService: RsaService,
    private readonly rsaDocumentService: RsaDocumentService,
  ) {}

  @Put('approve/rsa-application/:id')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async approveRsaApplication(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateRsaStatusDto,
    @Req() request,
  ) {
    const data = await this.rsaService.updateStatus(
      id,
      { ...body, status: RsaStatus.APPROVED },
      request,
    );
    return new StandardApiResponse(HttpStatus.OK, ResponseMessage.UPDATED, data);
  }

  @Put('decline/rsa-application/:id')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async declineRsaApplication(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateRsaStatusDto,
    @Req() request,
  ) {
    const data = await this.rsaService.updateStatus(
      id,
      { ...body, status: RsaStatus.DECLINED },
      request,
    );
    return new StandardApiResponse(HttpStatus.OK, ResponseMessage.UPDATED, data);
  }

  @Put('approve/document/:id')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async approveDocument(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateDocumentStatusDto,
  ) {
    const data = await this.rsaDocumentService.updateStatus(id, {
      ...body,
      status: DocumentStatus.APPROVED,
    });
    return new StandardApiResponse(HttpStatus.OK, ResponseMessage.UPDATED, data);
  }

  @Put('decline/document/:id')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async declineDocument(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateDocumentStatusDto,
  ) {
    const data = await this.rsaDocumentService.updateStatus(id, {
      ...body,
      status: DocumentStatus.DECLINED,
    });
    return new StandardApiResponse(HttpStatus.OK, ResponseMessage.UPDATED, data);
  }
}
