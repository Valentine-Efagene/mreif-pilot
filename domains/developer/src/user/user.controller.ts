import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import { User } from './user.entity';
import { UserService } from './user.service';
import { CreateUserDto } from './user.dto';
import { ApiHeader, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { StandardApiResponse } from '../common/common.dto';
import OpenApiHelper from '../common/OpenApiHelper';
import { ResponseMessage } from '../common/common.enum';
import { SwaggerAuth } from '@qshelter/nest-auth';

@SwaggerAuth()
@Controller('users')
@ApiTags('User')
@ApiResponse(OpenApiHelper.responseDoc)
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Post()
  async create(
    @Body() createUserDto: CreateUserDto,
  ): Promise<StandardApiResponse<User>> {
    const data = await this.userService.create(createUserDto);
    return new StandardApiResponse(HttpStatus.CREATED, ResponseMessage.CREATED, data);
  }

  @Get('/project-managers')
  @ApiHeader(OpenApiHelper.userIdHeader)
  @ApiResponse(OpenApiHelper.arrayResponseDoc)
  async findAllProjectManagers(): Promise<StandardApiResponse<User[]>> {
    const data = await this.userService.findAllProjectManagers();
    return new StandardApiResponse(HttpStatus.OK, ResponseMessage.FETCHED, data);
  }

  @Get()
  @ApiHeader(OpenApiHelper.userIdHeader)
  @ApiResponse(OpenApiHelper.arrayResponseDoc)
  async findAll(): Promise<StandardApiResponse<User[]>> {
    const data = await this.userService.findAll();
    return new StandardApiResponse(HttpStatus.OK, ResponseMessage.FETCHED, data);
  }

  @Get(':id')
  @ApiHeader(OpenApiHelper.userIdHeader)
  @ApiResponse(OpenApiHelper.responseDoc)
  async findOne(
    @Param('id', ParseIntPipe) id: number,): Promise<StandardApiResponse<User>> {
    const data = await this.userService.findOne(id);
    return new StandardApiResponse(HttpStatus.OK, ResponseMessage.FETCHED, data);
  }

  @Delete(':id')
  @ApiHeader(OpenApiHelper.userIdHeader)
  //@Roles([Role.ADMIN])
  @ApiOperation({ summary: '', tags: ['Admin'] })
  @ApiResponse(OpenApiHelper.nullResponseDoc)
  async remove(
    @Param('id', ParseIntPipe) id: number): Promise<StandardApiResponse<void>> {
    await this.userService.remove(id);
    return new StandardApiResponse(HttpStatus.NO_CONTENT, ResponseMessage.DELETED, null);
  }
}
