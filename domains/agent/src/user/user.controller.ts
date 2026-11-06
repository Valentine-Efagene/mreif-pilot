import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import { User } from './user.entity';
import { UserService } from './user.service';
import { CreateUserDto } from './user.dto';
import { ApiHeader, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ResponseMessage } from '../common/common.enum';
import { SwaggerAuth } from '../common/guard/swagger-auth.guard';
import OpenApiHelper from '../common/OpenApiHelper';
import { StandardApiResponse } from '../common/common.dto';
import { Paginate, Paginated, PaginateQuery } from 'nestjs-paginate';

@SwaggerAuth()
@Controller('users')
@ApiTags('User')
@ApiResponse(OpenApiHelper.responseDoc)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(
    @Body() createUserDto: CreateUserDto,
  ): Promise<StandardApiResponse<User>> {
    const data = await this.userService.create(createUserDto);
    return new StandardApiResponse(
      HttpStatus.CREATED,
      ResponseMessage.CREATED,
      data,
    );
  }

  // @Get()
  // @ApiHeader(OpenApiHelper.userIdHeader)
  // @ApiResponse(OpenApiHelper.arrayResponseDoc)
  // async findAll(): Promise<StandardApiResponse<User[]>> {
  //   const data = await this.userService.findAll();
  //   return new StandardApiResponse(HttpStatus.OK, ResponseMessage.FETCHED, data);
  // }

  @Get('paginate')
  @ApiHeader(OpenApiHelper.userIdHeader)
  @ApiResponse(OpenApiHelper.arrayResponseDoc)
  async findAllPaginated(
    @Paginate() query: PaginateQuery,
  ): Promise<StandardApiResponse<Paginated<User>>> {
    const data = await this.userService.findAllPaginated(query);
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
  ): Promise<StandardApiResponse<User>> {
    const data = await this.userService.findOne(id);
    return new StandardApiResponse(
      HttpStatus.OK,
      ResponseMessage.FETCHED,
      data,
    );
  }

  // @Delete(':id')
  // @ApiHeader(OpenApiHelper.userIdHeader)
  // //@Roles([UserRole.ADMIN])
  // @ApiOperation({ summary: '', tags: ['Admin'] })
  // @ApiResponse(OpenApiHelper.nullResponseDoc)
  // async remove(
  //   @Param('id', ParseIntPipe) id: number): Promise<StandardApiResponse<void>> {
  //   await this.userService.remove(id);
  //   return new StandardApiResponse(HttpStatus.NO_CONTENT, ResponseMessage.DELETED, null);
  // }
}
