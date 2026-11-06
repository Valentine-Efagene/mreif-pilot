import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  HttpStatus,
  ParseIntPipe,
  Patch,
  Delete,
  HttpCode,
  UsePipes,
  ValidationPipe,
  Req,
} from '@nestjs/common';
import { HomeOwner } from './home-owner.entity';
import { HomeOwnerService } from './home-owner.service';
import { CreateHomeOwnerDto, UpdateHomeOwnerDto, UpdateHomeOwnerStatusDto } from './home-owner.dto';
import { ApiHeader, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ResponseMessage } from '../common/common.enum';
import { SwaggerAuth } from '../common/guard/swagger-auth.guard';
import OpenApiHelper from '../common/OpenApiHelper';
import { StandardApiResponse } from '../common/common.dto';
import { Paginate, Paginated, PaginateQuery } from 'nestjs-paginate';
import { HomeOwnerDocument } from '../home-owner-document/home-owner-document.entity';
import { HomeOwnerPoc } from '../home-owner-poc/home-owner-poc.entity';
import { Request } from 'express';

@SwaggerAuth()
@Controller('home-owners')
@ApiTags('HomeOwner')
@ApiResponse(OpenApiHelper.responseDoc)
export class HomeOwnerController {
  constructor(private readonly homeOwnerService: HomeOwnerService) { }

  @HttpCode(HttpStatus.OK)
  @Post(':id/update-status')
  //@Roles([UserRole.ADMIN])
  @ApiOperation({ summary: '', tags: ['Admin'] })
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateHomeOwnerStatusDto,
  ): Promise<StandardApiResponse<HomeOwner>> {
    const data = await this.homeOwnerService.updateStatus(
      id,
      updateDto,
    );

    return new StandardApiResponse(HttpStatus.OK, ResponseMessage.UPDATED, data);
  }

  @Post()
  @ApiHeader(OpenApiHelper.userIdHeader)
  async create(
    @Body() createHomeOwnerDto: CreateHomeOwnerDto,
    @Req() request: Request,
  ): Promise<StandardApiResponse<HomeOwner>> {
    const data = await this.homeOwnerService.create(createHomeOwnerDto, request);
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
  ): Promise<StandardApiResponse<Paginated<HomeOwner>>> {
    const data = await this.homeOwnerService.findAllPaginated(query);
    return new StandardApiResponse(
      HttpStatus.OK,
      ResponseMessage.FETCHED,
      data,
    );
  }

  @ApiHeader(OpenApiHelper.userIdHeader)
  @Get('by-user/:id')
  async findOneByUser(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<StandardApiResponse<HomeOwner>> {
    const data = await this.homeOwnerService.findOneByUser(id);
    return new StandardApiResponse(HttpStatus.OK, ResponseMessage.FETCHED, data);
  }

  @Get(':id/documents')
  @ApiHeader(OpenApiHelper.userIdHeader)
  @ApiResponse(OpenApiHelper.responseDoc)
  async findAllDocuments(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<StandardApiResponse<HomeOwnerDocument[]>> {
    const data = await this.homeOwnerService.findDocumentsByHomeOwnerId(id);
    return new StandardApiResponse(
      HttpStatus.OK,
      ResponseMessage.FETCHED,
      data,
    );
  }

  @Get(':id/poc')
  @ApiHeader(OpenApiHelper.userIdHeader)
  @ApiResponse(OpenApiHelper.responseDoc)
  async findPoc(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<StandardApiResponse<HomeOwnerPoc>> {
    const data = await this.homeOwnerService.findPocByHomeOwnerId(id);
    return new StandardApiResponse(
      HttpStatus.OK,
      ResponseMessage.FETCHED,
      data,
    );
  }

  @Get(':id')
  @ApiHeader(OpenApiHelper.userIdHeader)
  @ApiResponse(OpenApiHelper.responseDoc)
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<StandardApiResponse<HomeOwner>> {
    const data = await this.homeOwnerService.findOne(id);
    return new StandardApiResponse(
      HttpStatus.OK,
      ResponseMessage.FETCHED,
      data,
    );
  }

  @Patch(':id')
  @ApiHeader(OpenApiHelper.userIdHeader)
  @ApiResponse(OpenApiHelper.responseDoc)
  async updateOne(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateHomeOwnerDto,
  ): Promise<StandardApiResponse<HomeOwner>> {
    const data = await this.homeOwnerService.updateOne({ id, ...dto });
    return new StandardApiResponse(
      HttpStatus.OK,
      ResponseMessage.FETCHED,
      data,
    );
  }

  @Delete(':id')
  @ApiHeader(OpenApiHelper.userIdHeader)
  //@Roles([HomeOwnerRole.ADMIN])
  @ApiOperation({ summary: '', tags: ['Admin'] })
  @ApiResponse(OpenApiHelper.nullResponseDoc)
  async remove(
    @Param('id', ParseIntPipe) id: number): Promise<StandardApiResponse<void>> {
    await this.homeOwnerService.remove(id);
    return new StandardApiResponse(HttpStatus.NO_CONTENT, ResponseMessage.DELETED, null);
  }
}
