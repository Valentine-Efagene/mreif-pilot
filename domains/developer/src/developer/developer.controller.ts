import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Patch,
  Query,
  UseInterceptors,
  BadRequestException,
  UsePipes,
  ValidationPipe,
  HttpStatus,
  ParseIntPipe,
  HttpCode,
  Req,
} from '@nestjs/common';
import { Developer } from './developer.entity';
import { DeveloperService } from './developer.service';
import {
  CreateDeveloperDto,
  DeveloperWithWallet,
  FindByUserIdsDto,
  UpdateDeveloperDto,
  UpdateDeveloperOnboardingStageDto,
  UpdateDeveloperStatusDto,
} from './developer.dto';
import { Paginate, PaginateQuery, Paginated } from 'nestjs-paginate';
import {
  ApiHeader,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import OpenApiHelper from '../common/OpenApiHelper';
import { FileInterceptor } from '@nestjs/platform-express';
import { StandardApiResponse } from '../common/common.dto';
import { S3UploaderService } from '../s3-uploader/s3-uploader.service';
import { ResponseMessage } from '../common/common.enum';
import { SwaggerAuth } from '@qshelter/nest-auth';
import { Request } from 'express';

@SwaggerAuth()
@Controller('developers')
@ApiTags('Developer')
@ApiResponse(OpenApiHelper.responseDoc)
export class DeveloperController {
  constructor(
    private readonly developerService: DeveloperService,
    private readonly uploaderService: S3UploaderService,
  ) { }

  @Get('by-user-ids')
  @ApiHeader(OpenApiHelper.userIdHeader)
  @ApiOperation({
    summary: 'Get developers by user IDs',
    description: 'Returns an array of developers associated with the provided user IDs. Pass userIds as comma-separated values: ?userIds=1,2,3',
  })
  async findByUserIds(
    @Query('userIds') userIdsParam: string,
  ): Promise<StandardApiResponse<Developer[]>> {
    if (!userIdsParam) {
      throw new BadRequestException('userIds query parameter is required');
    }

    // Parse comma-separated string to array of numbers
    const userIds = userIdsParam
      .split(',')
      .map(id => {
        const parsed = parseInt(id.trim(), 10);
        if (isNaN(parsed)) {
          throw new BadRequestException(`Invalid user ID: ${id}`);
        }
        return parsed;
      });

    const data = await this.developerService.findByUserIds(userIds);
    return new StandardApiResponse(HttpStatus.OK, ResponseMessage.FETCHED, data);
  }

  @Post()
  @ApiHeader(OpenApiHelper.userIdHeader)
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(
    @Body() createDeveloperDto: CreateDeveloperDto,
    @Req() request: Request
  ): Promise<StandardApiResponse<Developer>> {
    const data = await this.developerService.create(createDeveloperDto, request);
    return new StandardApiResponse(HttpStatus.CREATED, ResponseMessage.CREATED, data);
  }

  @Get()
  @ApiHeader(OpenApiHelper.userIdHeader)
  async findAll(): Promise<StandardApiResponse<Developer[]>> {
    const data = await this.developerService.findAll();
    return new StandardApiResponse(HttpStatus.OK, ResponseMessage.FETCHED, data);
  }

  @Get('names')
  async findAllNamesOnly(): Promise<StandardApiResponse<Developer[]>> {
    const data = await this.developerService.findAllNamesOnly();
    return new StandardApiResponse(HttpStatus.OK, ResponseMessage.FETCHED, data);
  }

  @Get('all-paginated')
  //@Roles([Role.ADMIN])
  @ApiHeader(OpenApiHelper.userIdHeader)
  @ApiResponse(OpenApiHelper.paginatedResponseDoc)
  @ApiOperation({
    summary: 'Get all developers',
    tags: ['Admin'],
    description: 'Paginated Response',
  })
  public async findAllPaginated(
    @Paginate() query: PaginateQuery,
  ): Promise<StandardApiResponse<Paginated<Developer>>> {
    const data = await this.developerService.findAllPaginated(query);
    return new StandardApiResponse(HttpStatus.OK, ResponseMessage.FETCHED, data);
  }


  @HttpCode(HttpStatus.OK)
  @Post(':id/update-status')
  //@Roles([Role.ADMIN])
  @ApiHeader(OpenApiHelper.userIdHeader)
  @ApiOperation({ summary: '', tags: ['Admin'] })
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateDeveloperStatusDto,
    @Req() request: Request
  ): Promise<StandardApiResponse<Developer>> {
    const data = await this.developerService.updateStatus(
      id,
      updateDto,
      request
    );

    return new StandardApiResponse(HttpStatus.OK, ResponseMessage.UPDATED, data);
  }

  @Get(':id/stats')
  @ApiHeader(OpenApiHelper.userIdHeader)
  async findOneStats(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<StandardApiResponse<Record<string, number>>> {
    const data = await this.developerService.getStats(id);
    return new StandardApiResponse(HttpStatus.OK, ResponseMessage.FETCHED, data);
  }

  @Get('by-user-with-wallet/:id')
  @ApiHeader(OpenApiHelper.userIdHeader)
  async findOneWithWallet(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<StandardApiResponse<DeveloperWithWallet>> {
    const data = await this.developerService.findOneByUserWithWallet(id);
    return new StandardApiResponse(HttpStatus.OK, ResponseMessage.FETCHED, data);
  }

  @Get(':id')
  @ApiHeader(OpenApiHelper.userIdHeader)
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<StandardApiResponse<Developer>> {
    const data = await this.developerService.findOne(id);
    return new StandardApiResponse(HttpStatus.OK, ResponseMessage.FETCHED, data);
  }

  @Get('by-user/:id')
  @ApiHeader(OpenApiHelper.userIdHeader)
  async findOneByUser(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<StandardApiResponse<Developer>> {
    const data = await this.developerService.findOneByUser(id);
    return new StandardApiResponse(HttpStatus.OK, ResponseMessage.FETCHED, data);
  }

  @Post(':id/update-onboarding-stage')
  //@Roles([Role.ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiHeader(OpenApiHelper.userIdHeader)
  @ApiOperation({ summary: '' })
  async updateOnboardingStage(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOnboardingDto: UpdateDeveloperOnboardingStageDto,
    @Req() request: Request
  ): Promise<StandardApiResponse<Developer>> {
    const data = await this.developerService.updateOnboardingStage(
      id,
      updateOnboardingDto,
      request
    );
    return new StandardApiResponse(HttpStatus.OK, ResponseMessage.UPDATED, data);
  }

  @Patch(':id')
  @ApiHeader(OpenApiHelper.userIdHeader)
  async updateDeveloper(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateDeveloperDto,
    @Req() request: Request
  ): Promise<StandardApiResponse<Developer>> {
    const data = await this.developerService.updateOne(id, updateDto, request);
    return new StandardApiResponse(HttpStatus.OK, ResponseMessage.UPDATED, data);
  }

  @Delete(':id')
  //@Roles([Role.ADMIN])
  @ApiHeader(OpenApiHelper.userIdHeader)
  @ApiOperation({ summary: '', tags: ['Admin'] })
  async remove(
    @Param('id', ParseIntPipe) id: number): Promise<StandardApiResponse<void>> {
    await this.developerService.remove(id);
    return new StandardApiResponse(HttpStatus.OK, ResponseMessage.DELETED, null);
  }

  // @Put('logo/:id')
  // @ApiHeader(OpenApiHelper.userIdHeader)
  // @ApiOperation({
  //   summary: 'Upload a file',
  //   description: '',
  // })
  // @ApiConsumes('multipart/form-data')
  // @UseInterceptors(FileInterceptor('file'))
  // async uploadLogo(
  //   @UploadedFile(FileValidators.imageValidator)
  //   file: Express.Multer.File,
  //   @Param('id', ParseIntPipe) id: number,
  //   // eslint-disable-next-line @typescript-eslint/no-unused-vars
  //   @Body() body: AvatarUploadDto,
  // ): Promise<StandardApiResponse<string>> {
  //   if (!file) {
  //     throw new BadRequestException();
  //   }

  //   const developer = await this.developerService.findOne(id);

  //   if (!developer) {
  //     throw new BadRequestException();
  //   }

  //   let url = null;

  //   if (developer.logo) {
  //     url = await this.uploaderService.replaceImageOnS3(
  //       file,
  //       S3Folder.LOGO,
  //       developer.logo,
  //     );
  //   } else {
  //     url = await this.uploaderService.uploadImageToS3(file, S3Folder.LOGO);
  //   }

  //   await this.developerService.updateOne(id, { logo: url });

  //   return new StandardApiResponse(HttpStatus.OK, ResponseMessage.UPDATED, url);
  // }

  @Delete('logo/:id')
  @ApiHeader(OpenApiHelper.userIdHeader)
  @ApiOperation({
    summary: 'Delete a file',
    description: '',
  })
  @UseInterceptors(FileInterceptor('file'))
  async deleteLogo(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: Request
  ): Promise<StandardApiResponse<string>> {
    const developer = await this.developerService.findOne(id);

    if (!developer) {
      throw new BadRequestException();
    }

    if (developer.logo) {
      await this.uploaderService.deleteFromS3(developer.logo);
      await this.developerService.updateOne(id, { logo: null }, request);
    }

    return new StandardApiResponse(HttpStatus.NO_CONTENT, ResponseMessage.DELETED, null);
  }
}
