import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import { Referral } from './referral.entity';
import { ReferralService } from './referral.service';
import { CreateReferralDto } from './referral.dto';
import { ApiHeader, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ResponseMessage } from '../common/common.enum';
import { SwaggerAuth } from '../common/guard/swagger-auth.guard';
import OpenApiHelper from '../common/OpenApiHelper';
import { StandardApiResponse } from '../common/common.dto';
import { Paginate, Paginated, PaginateQuery } from 'nestjs-paginate';
import { User } from '../user/user.entity';

@SwaggerAuth()
@Controller('referrals')
@ApiTags('Referral')
@ApiResponse(OpenApiHelper.responseDoc)
export class ReferralController {
  constructor(private readonly referralService: ReferralService) { }

  @Post()
  async create(
    @Body() createReferralDto: CreateReferralDto,
  ): Promise<StandardApiResponse<Referral>> {
    const data = await this.referralService.create(createReferralDto);
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
  ): Promise<StandardApiResponse<Paginated<Referral>>> {
    const data = await this.referralService.findAllPaginated(query);
    return new StandardApiResponse(
      HttpStatus.OK,
      ResponseMessage.FETCHED,
      data,
    );
  }

  // @Get('by-agent/:id/paginate')
  // @ApiHeader(OpenApiHelper.userIdHeader)
  // @ApiResponse(OpenApiHelper.arrayResponseDoc)
  // async findAllByAgentPaginated(
  //   @Param('id', ParseIntPipe) id: number,
  //   @Paginate() query: PaginateQuery,
  // ): Promise<StandardApiResponse<Paginated<User>>> {
  //   const data = await this.referralService.findAllPaginatedByAgent(query, id);
  //   return new StandardApiResponse(
  //     HttpStatus.OK,
  //     ResponseMessage.FETCHED,
  //     data,
  //   );
  // }

  @Get('by-agent/:id/referrees')
  @ApiHeader(OpenApiHelper.userIdHeader)
  @ApiResponse(OpenApiHelper.arrayResponseDoc)
  async findAllByAgent(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<StandardApiResponse<User[]>> {
    const data = await this.referralService.getAllReferreesByAgent(id);
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
  ): Promise<StandardApiResponse<Referral>> {
    const data = await this.referralService.findOne(id);
    return new StandardApiResponse(
      HttpStatus.OK,
      ResponseMessage.FETCHED,
      data,
    );
  }

  // @Delete(':id')
  // @ApiHeader(OpenApiHelper.referralIdHeader)
  // //@Roles([ReferralRole.ADMIN])
  // @ApiOperation({ summary: '', tags: ['Admin'] })
  // @ApiResponse(OpenApiHelper.nullResponseDoc)
  // async remove(
  //   @Param('id', ParseIntPipe) id: number): Promise<StandardApiResponse<void>> {
  //   await this.referralService.remove(id);
  //   return new StandardApiResponse(HttpStatus.NO_CONTENT, ResponseMessage.DELETED, null);
  // }
}
