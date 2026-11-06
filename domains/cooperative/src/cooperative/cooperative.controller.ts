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
import { Cooperative } from './cooperative.entity';
import { CooperativeService } from './cooperative.service';
import {
  AssignAdminDto,
  AvatarUploadDto,
  CreateCooperativeDto,
  RestoreCooperativeDto,
  UpdateCooperativeDto,
} from './cooperative.dto';
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
@Controller('cooperatives')
@ApiTags('Cooperatives')
@ApiResponse(OpenApiHelper.responseDoc)
export class CooperativeController {
  constructor(
    private readonly cooperativeService: CooperativeService,
    private readonly uploaderService: S3UploaderService,
  ) { }

  @ApiHeader(OpenApiHelper.userIdHeader)
  @Put(":id/assign-admin")
  async assignAdmin(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Omit<AssignAdminDto, 'cooperativeId'>
  ): Promise<StandardApiResponse<Cooperative>> {
    const data = await this.cooperativeService.assignAdmin({ cooperativeId: id, ...dto })
    return new StandardApiResponse(HttpStatusCode.Ok, ResponseMessage.UPDATED, data)
  }

  @ApiHeader(OpenApiHelper.userIdHeader)
  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(
    @Body() createCooperativeDto: CreateCooperativeDto,
  ): Promise<StandardApiResponse<Cooperative>> {
    const data = await this.cooperativeService.create(createCooperativeDto);
    return new StandardApiResponse(HttpStatus.CREATED, ResponseMessage.CREATED, data);
  }

  @ApiHeader(OpenApiHelper.userIdHeader)
  @Post('restore')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async restore(
    @Body() dto: RestoreCooperativeDto,
  ): Promise<StandardApiResponse<Cooperative>> {
    const data = await this.cooperativeService.restore(dto.id);
    return new StandardApiResponse(HttpStatus.OK, ResponseMessage.UPDATED, data);
  }

  @ApiHeader(OpenApiHelper.userIdHeader)
  @Get()
  async findAll(): Promise<StandardApiResponse<Cooperative[]>> {
    const data = await this.cooperativeService.findAll();
    return new StandardApiResponse(HttpStatus.OK, ResponseMessage.FETCHED, data);
  }

  @ApiHeader(OpenApiHelper.userIdHeader)
  @Get(":id/members")
  async members(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<StandardApiResponse<User[]>> {
    const data = await this.cooperativeService.fetchMembers(id);
    return new StandardApiResponse(HttpStatus.OK, ResponseMessage.FETCHED, data);
  }

  @Get('names')
  async findAllNamesOnly(): Promise<StandardApiResponse<Cooperative[]>> {
    const data = await this.cooperativeService.findAllNamesOnly();
    return new StandardApiResponse(HttpStatus.OK, ResponseMessage.FETCHED, data);
  }

  @ApiHeader(OpenApiHelper.userIdHeader)
  @Get('paginate')
  //@Roles([UserRole.ADMIN])
  @ApiResponse(OpenApiHelper.paginatedResponseDoc)
  @ApiOperation({
    summary: 'Get all cooperatives',
    tags: ['Admin'],
    description: 'Paginated Response',
  })
  public async findAllPaginated(
    @Paginate() query: PaginateQuery,
  ): Promise<StandardApiResponse<Paginated<Cooperative>>> {
    const data = await this.cooperativeService.findAllPaginated(query);
    return new StandardApiResponse(HttpStatus.OK, ResponseMessage.FETCHED, data);
  }

  @ApiHeader(OpenApiHelper.userIdHeader)
  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<StandardApiResponse<Cooperative>> {
    const data = await this.cooperativeService.findOne(id);
    return new StandardApiResponse(HttpStatus.OK, ResponseMessage.FETCHED, data);
  }

  @ApiHeader(OpenApiHelper.userIdHeader)
  @Get('by-user/:id')
  async findOneByUser(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<StandardApiResponse<Cooperative>> {
    const data = await this.cooperativeService.findOneByUser(id);
    return new StandardApiResponse(HttpStatus.OK, ResponseMessage.FETCHED, data);
  }

  @ApiHeader(OpenApiHelper.userIdHeader)
  @Patch(':id')
  async updateCooperative(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateCooperativeDto,
  ): Promise<StandardApiResponse<Cooperative>> {
    const data = await this.cooperativeService.updateOne(id, updateDto);
    return new StandardApiResponse(HttpStatus.OK, ResponseMessage.UPDATED, data);
  }

  // @ApiHeader(OpenApiHelper.userIdHeader)
  // @Delete(':id')
  // //@Roles([UserRole.ADMIN])
  // @ApiOperation({ summary: '', tags: ['Admin'] })
  // async remove(
  //   @Param('id', ParseIntPipe) id: number): Promise<StandardApiResponse<void>> {
  //   await this.cooperativeService.remove(id);
  //   return new StandardApiResponse(HttpStatus.OK, ResponseMessage.DELETED, null);
  // }

  @ApiHeader(OpenApiHelper.userIdHeader)
  @Delete(':id')
  //@Roles([UserRole.ADMIN])
  @ApiOperation({ summary: '', tags: ['Admin'] })
  async softDelete(
    @Param('id', ParseIntPipe) id: number): Promise<StandardApiResponse<void>> {
    await this.cooperativeService.remove(id);
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

    const cooperative = await this.cooperativeService.findOne(id);

    if (!cooperative) {
      throw new BadRequestException();
    }

    let url = null;

    if (cooperative.logo) {
      url = await this.uploaderService.replaceImageOnS3(
        file,
        S3Folder.LOGO,
        cooperative.logo,
      );
    } else {
      url = await this.uploaderService.uploadImageToS3(file, S3Folder.LOGO);
    }

    await this.cooperativeService.updateOne(id, { logo: url });

    return new StandardApiResponse(HttpStatus.OK, ResponseMessage.UPDATED, url);
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
    const cooperative = await this.cooperativeService.findOne(id);

    if (!cooperative) {
      throw new BadRequestException();
    }

    if (cooperative.logo) {
      await this.uploaderService.deleteFromS3(cooperative.logo);
      await this.cooperativeService.updateOne(id, { logo: null });
    }

    return new StandardApiResponse(HttpStatus.NO_CONTENT, ResponseMessage.DELETED, null);
  }
}
