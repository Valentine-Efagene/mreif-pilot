import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseInterceptors,
  BadRequestException,
  UploadedFile,
  HttpStatus,
  ParseIntPipe,
  Patch,
} from '@nestjs/common';
import { LicensingInfo } from './licensing-info.entity';
import { LicensingInfoService } from './licensing-info.service';
import {
  CreateLicensingInfoControllerDto,
  UpdateLicensingInfoDto,
} from './licensing-info.dto';
import {
  ApiConsumes,
  ApiHeader,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { ResponseMessage } from '../common/common.enum';
import { SwaggerAuth } from '../common/guard/swagger-auth.guard';
import OpenApiHelper from '../common/helpers/OpenApiHelper';
import { StandardApiResponse } from '../common/common.dto';
import { Paginate, Paginated, PaginateQuery } from 'nestjs-paginate';

@SwaggerAuth()
@Controller('licensing-infos')
@ApiTags('Licensing Infos')
@ApiResponse(OpenApiHelper.responseDoc)
export class LicensingInfoController {
  constructor(
    private readonly licensingInfoService: LicensingInfoService,
  ) { }

  @Post()
  @ApiOperation({
    summary: 'Create licensing info',
    description: '',
  })
  async create(
    @Body() dto: CreateLicensingInfoControllerDto,
  ): Promise<StandardApiResponse<LicensingInfo>> {

    const data = await this.licensingInfoService.create(dto);

    return new StandardApiResponse(
      HttpStatus.CREATED,
      ResponseMessage.CREATED,
      data,
    );
  }

  @Get('paginate')
  @ApiHeader(OpenApiHelper.userIdHeader)
  @ApiResponse(OpenApiHelper.arrayResponseDoc)
  async findAllPaginated(
    @Paginate() query: PaginateQuery,
  ): Promise<StandardApiResponse<Paginated<LicensingInfo>>> {
    const data = await this.licensingInfoService.findAllPaginated(query);
    return new StandardApiResponse(
      HttpStatus.OK,
      ResponseMessage.FETCHED,
      data,
    );
  }

  @Patch(':id')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async updateOne(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateLicensingInfoDto,
  ): Promise<StandardApiResponse<LicensingInfo>> {
    const data = await this.licensingInfoService.reupload(id, updateDto);
    return new StandardApiResponse(
      HttpStatus.OK,
      ResponseMessage.UPDATED,
      data,
    );
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<StandardApiResponse<void>> {
    await this.licensingInfoService.remove(id);

    return new StandardApiResponse(
      HttpStatus.NO_CONTENT,
      ResponseMessage.DELETED,
      null,
    );
  }
}
