import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Patch,
  Put,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  UsePipes,
  ValidationPipe,
  HttpStatus,
  ParseIntPipe,
  HttpCode,
} from '@nestjs/common';
import { Pmb } from './pmb.entity';
import { PmbService } from './pmb.service';
import {
  AssignAdminDto,
  AvatarUploadDto,
  CreatePmbDto,
  RestorePmbDto,
  SinglePmbStatsDto,
  UpdatePmbDto,
} from './pmb.dto';
import { Paginate, PaginateQuery, Paginated } from 'nestjs-paginate';
import {
  ApiConsumes,
  ApiHeader,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import OpenApiHelper from '../common/OpenApiHelper';
import { FileInterceptor } from '@nestjs/platform-express';
import { StandardApiResponse } from '../common/common.dto';
import { S3UploaderService } from '../s3-uploader/s3-uploader.service';
import { ResponseMessage, S3Folder } from '../common/common.enum';
import FileValidators from '../common/validator/FileValidators';
import { SwaggerAuth } from '../common/guard/swagger-auth.guard';
import { User } from '../user/user.entity';
import { HttpStatusCode } from 'axios';

@SwaggerAuth()
@Controller('pmbs')
@ApiTags('Mortgage Lenders')
@ApiResponse(OpenApiHelper.responseDoc)
export class PmbController {
  constructor(
    private readonly pmbService: PmbService,
    private readonly uploaderService: S3UploaderService,
  ) { }

  @ApiHeader(OpenApiHelper.userIdHeader)
  @Put(":id/assign-admin")
  async assignAdmin(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Omit<AssignAdminDto, 'pmbId'>
  ): Promise<StandardApiResponse<Pmb>> {
    const data = await this.pmbService.assignAdmin({ pmbId: id, ...dto })
    return new StandardApiResponse(HttpStatusCode.Ok, ResponseMessage.UPDATED, data)
  }

  // @ApiHeader(OpenApiHelper.userIdHeader)
  // @Post(':id/toggle-listing')
  // @HttpCode(HttpStatus.OK)
  // @UsePipes(new ValidationPipe({ transform: true }))
  // async toggleListing(
  //   @Param('id', ParseIntPipe) id: number,
  // ): Promise<StandardApiResponse<Pmb>> {
  //   const data = await this.pmbService.toggleListing(id);
  //   return new StandardApiResponse(HttpStatus.OK, ResponseMessage.UPDATED, data);
  // }

  @ApiHeader(OpenApiHelper.userIdHeader)
  @Post(':id/toggle-listing')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async toggleListing(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<StandardApiResponse<Pmb>> {
    const data = await this.pmbService.toggleListing(id);
    return new StandardApiResponse(HttpStatus.OK, ResponseMessage.UPDATED, data);
  }

  @ApiHeader(OpenApiHelper.userIdHeader)
  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(
    @Body() createPmbDto: CreatePmbDto,
  ): Promise<StandardApiResponse<Pmb>> {
    const data = await this.pmbService.create(createPmbDto);
    return new StandardApiResponse(HttpStatus.CREATED, ResponseMessage.CREATED, data);
  }

  @ApiHeader(OpenApiHelper.userIdHeader)
  @Post('restore')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async restore(
    @Body() dto: RestorePmbDto,
  ): Promise<StandardApiResponse<Pmb>> {
    const data = await this.pmbService.restore(dto.id);
    return new StandardApiResponse(HttpStatus.OK, ResponseMessage.UPDATED, data);
  }

  @ApiHeader(OpenApiHelper.userIdHeader)
  @Get()
  async findAll(): Promise<StandardApiResponse<Pmb[]>> {
    const data = await this.pmbService.findAll();
    return new StandardApiResponse(HttpStatus.OK, ResponseMessage.FETCHED, data);
  }

  @ApiHeader(OpenApiHelper.userIdHeader)
  @Get(":id/staff")
  async staff(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<StandardApiResponse<User[]>> {
    const data = await this.pmbService.fetchStaff(id);
    return new StandardApiResponse(HttpStatus.OK, ResponseMessage.FETCHED, data);
  }

  @ApiHeader(OpenApiHelper.userIdHeader)
  @Get(":id/stats")
  async stats(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<StandardApiResponse<SinglePmbStatsDto>> {
    const data = await this.pmbService.fetchStats(id);
    return new StandardApiResponse(HttpStatus.OK, ResponseMessage.FETCHED, data);
  }

  @ApiHeader(OpenApiHelper.userIdHeader)
  @Get(":id/customers")
  async users(
    @Param('id', ParseIntPipe) id: number,
    @Paginate() query: PaginateQuery,
  ): Promise<StandardApiResponse<Paginated<User>>> {
    const data = await this.pmbService.fetchRefereesPaginated(id, query);
    return new StandardApiResponse(HttpStatus.OK, ResponseMessage.FETCHED, data);
  }

  @Get('names')
  async findAllNamesOnly(): Promise<StandardApiResponse<Pmb[]>> {
    const data = await this.pmbService.findAllNamesOnly();
    return new StandardApiResponse(HttpStatus.OK, ResponseMessage.FETCHED, data);
  }

  @ApiHeader(OpenApiHelper.userIdHeader)
  @Get('paginate')
  //@Roles([UserRole.ADMIN])
  @ApiResponse(OpenApiHelper.paginatedResponseDoc)
  @ApiOperation({
    summary: 'Get all pmbs',
    tags: ['Admin'],
    description: 'Paginated Response',
  })
  public async findAllPaginated(
    @Paginate() query: PaginateQuery,
  ): Promise<StandardApiResponse<Paginated<Pmb>>> {
    const data = await this.pmbService.findAllPaginated(query);
    return new StandardApiResponse(HttpStatus.OK, ResponseMessage.FETCHED, data);
  }

  @ApiHeader(OpenApiHelper.userIdHeader)
  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<StandardApiResponse<Pmb>> {
    const data = await this.pmbService.findOne(id);
    return new StandardApiResponse(HttpStatus.OK, ResponseMessage.FETCHED, data);
  }

  @ApiHeader(OpenApiHelper.userIdHeader)
  @Get('by-user/:id')
  async findOneByUser(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<StandardApiResponse<Pmb>> {
    const data = await this.pmbService.findOneByUser(id);
    return new StandardApiResponse(HttpStatus.OK, ResponseMessage.FETCHED, data);
  }

  @ApiHeader(OpenApiHelper.userIdHeader)
  @Patch(':id')
  async updatePmb(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdatePmbDto,
  ): Promise<StandardApiResponse<Pmb>> {
    const data = await this.pmbService.updateOne(id, updateDto);
    return new StandardApiResponse(HttpStatus.OK, ResponseMessage.UPDATED, data);
  }

  // @ApiHeader(OpenApiHelper.userIdHeader)
  // @Delete(':id')
  // //@Roles([UserRole.ADMIN])
  // @ApiOperation({ summary: '', tags: ['Admin'] })
  // async remove(
  //   @Param('id', ParseIntPipe) id: number): Promise<StandardApiResponse<void>> {
  //   await this.pmbService.remove(id);
  //   return new StandardApiResponse(HttpStatus.OK, ResponseMessage.DELETED, null);
  // }

  @ApiHeader(OpenApiHelper.userIdHeader)
  @Delete(':id')
  //@Roles([UserRole.ADMIN])
  @ApiOperation({ summary: '', tags: ['Admin'] })
  async softDelete(
    @Param('id', ParseIntPipe) id: number): Promise<StandardApiResponse<void>> {
    await this.pmbService.remove(id);
    return new StandardApiResponse(HttpStatus.OK, ResponseMessage.DELETED, null);
  }

  @ApiHeader(OpenApiHelper.userIdHeader)
  @Put('logo/:id')
  @ApiOperation({
    summary: 'Upload a file',
    description: '',
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async uploadLogo(
    @UploadedFile(FileValidators.imageValidator)
    file: Express.Multer.File,
    @Param('id', ParseIntPipe) id: number,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Body() body: AvatarUploadDto,
  ): Promise<StandardApiResponse<string>> {
    if (!file) {
      throw new BadRequestException();
    }

    const pmb = await this.pmbService.findOne(id);

    if (!pmb) {
      throw new BadRequestException();
    }

    let url = null;

    if (pmb.logo) {
      url = await this.uploaderService.replaceImageOnS3(
        file,
        S3Folder.LOGO,
        pmb.logo,
      );
    } else {
      url = await this.uploaderService.uploadImageToS3(file, S3Folder.LOGO);
    }

    await this.pmbService.updateOne(id, { logo: url });

    return new StandardApiResponse(HttpStatus.OK, ResponseMessage.UPDATED, url);
  }

  @Get('logo/:name')
  @ApiHeader(OpenApiHelper.userIdHeader)
  @ApiOperation({
    summary: 'Get logo',
    description: 'Get Logo',
  })
  async getLogo(@Param('name') name: string): Promise<StandardApiResponse<string>> {
    const logo = await this.pmbService.getLogo(name);
    return new StandardApiResponse(HttpStatus.OK, ResponseMessage.FETCHED, logo);
  }

  @ApiHeader(OpenApiHelper.userIdHeader)
  @Delete('logo/:id')
  @ApiOperation({
    summary: 'Delete a file',
    description: '',
  })
  @UseInterceptors(FileInterceptor('file'))
  async deleteLogo(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<StandardApiResponse<string>> {
    const pmb = await this.pmbService.findOne(id);

    if (!pmb) {
      throw new BadRequestException();
    }

    if (pmb.logo) {
      await this.uploaderService.deleteFromS3(pmb.logo);
      await this.pmbService.updateOne(id, { logo: null });
    }

    return new StandardApiResponse(HttpStatus.NO_CONTENT, ResponseMessage.DELETED, null);
  }
}
