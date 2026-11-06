import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  HttpStatus,
  ParseIntPipe,
  Patch,
  Query,
  HttpCode,
  UsePipes,
  ValidationPipe,
  Req,
} from '@nestjs/common';
import { Agent } from './agent.entity';
import { AgentService } from './agent.service';
import { CreateAgentDto, ReferreePaginationDto, UpdateAgentDto, UpdateAgentStatusDto } from './agent.dto';
import { ApiHeader, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ResponseMessage } from '../common/common.enum';
import { SwaggerAuth } from '../common/guard/swagger-auth.guard';
import OpenApiHelper from '../common/OpenApiHelper';
import { StandardApiResponse } from '../common/common.dto';
import { Paginate, Paginated, PaginateQuery } from 'nestjs-paginate';
import { PaginatedUsers } from '../user/user.dto';
import { AgentCommissionPaginationDto, PaginatedCommissions } from '../commission/commission.dto';
import { LicensingDocument } from '../licensing-document/licensing-document.entity';
import { AgentIdValidationPipe } from '../common/pipes/agent-id-validation.pipe';
import { Request } from 'express';

@SwaggerAuth()
@Controller('agents')
@ApiTags('Agent')
@ApiResponse(OpenApiHelper.responseDoc)
export class AgentController {
  constructor(private readonly agentService: AgentService) { }

  @Post()
  @ApiHeader(OpenApiHelper.userIdHeader)
  async create(
    @Body() createAgentDto: CreateAgentDto,
    @Req() request: Request,
  ): Promise<StandardApiResponse<Agent>> {
    const data = await this.agentService.create(createAgentDto, request);
    return new StandardApiResponse(
      HttpStatus.CREATED,
      ResponseMessage.CREATED,
      data,
    );
  }

  // @Get()
  // @ApiHeader(OpenApiHelper.userIdHeader)
  // @ApiResponse(OpenApiHelper.arrayResponseDoc)
  // async findAll(): Promise<StandardApiResponse<Agent[]>> {
  //   const data = await this.agentService.findAll();
  //   return new StandardApiResponse(HttpStatus.OK, ResponseMessage.FETCHED, data);
  // }

  @Get('paginate')
  @ApiHeader(OpenApiHelper.userIdHeader)
  @ApiResponse(OpenApiHelper.arrayResponseDoc)
  async findAllPaginated(
    @Paginate() query: PaginateQuery,
  ): Promise<StandardApiResponse<Paginated<Agent>>> {
    const data = await this.agentService.findAllPaginated(query);
    return new StandardApiResponse(
      HttpStatus.OK,
      ResponseMessage.FETCHED,
      data,
    );
  }

  @Get(':id/referrees')
  @ApiHeader(OpenApiHelper.userIdHeader)
  @ApiResponse(OpenApiHelper.responseDoc)
  async getReferrees(
    @Param('id', AgentIdValidationPipe) id: number,
    @Query() query: ReferreePaginationDto,
  ): Promise<StandardApiResponse<PaginatedUsers>> {
    const data = await this.agentService.getReferrees(query, id);
    return new StandardApiResponse(
      HttpStatus.OK,
      ResponseMessage.FETCHED,
      data,
    );
  }

  @Get(':id/licensing-documents')
  @ApiHeader(OpenApiHelper.userIdHeader)
  @ApiResponse(OpenApiHelper.responseDoc)
  async findAllLicensingDocuments(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<StandardApiResponse<LicensingDocument[]>> {
    const data = await this.agentService.findLicensingDocumentsByAgentId(id);
    return new StandardApiResponse(
      HttpStatus.OK,
      ResponseMessage.FETCHED,
      data,
    );
  }

  @Get(':id/commissions')
  @ApiHeader(OpenApiHelper.userIdHeader)
  @ApiResponse(OpenApiHelper.responseDoc)
  async getCommissions(
    @Param('id', ParseIntPipe) id: number,
    @Query() query: AgentCommissionPaginationDto,
  ): Promise<StandardApiResponse<PaginatedCommissions>> {
    const data = await this.agentService.getCommissions(query, id);
    return new StandardApiResponse(
      HttpStatus.OK,
      ResponseMessage.FETCHED,
      data,
    );
  }

  @Get(':id/total-commission')
  @ApiHeader(OpenApiHelper.userIdHeader)
  @ApiResponse(OpenApiHelper.responseDoc)
  async getTotalCommission(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<StandardApiResponse<number>> {
    const data = await this.agentService.getTotalCommission(id);
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
  ): Promise<StandardApiResponse<Agent>> {
    const data = await this.agentService.findOne(id);
    return new StandardApiResponse(
      HttpStatus.OK,
      ResponseMessage.FETCHED,
      data,
    );
  }


  @ApiHeader(OpenApiHelper.userIdHeader)
  @Get('by-referral-code/:code')
  async findOneByReferralCode(
    @Param('code') code: string,
  ): Promise<StandardApiResponse<Agent>> {
    const data = await this.agentService.findOneByReferralCode(code);
    return new StandardApiResponse(HttpStatus.OK, ResponseMessage.FETCHED, data);
  }

  @ApiHeader(OpenApiHelper.userIdHeader)
  @Get('by-user/:id')
  async findOneByUser(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<StandardApiResponse<Agent>> {
    const data = await this.agentService.findOneByUser(id);
    return new StandardApiResponse(HttpStatus.OK, ResponseMessage.FETCHED, data);
  }

  @HttpCode(HttpStatus.OK)
  @Post(':id/update-status')
  //@Roles([UserRole.ADMIN])
  @ApiOperation({ summary: '', tags: ['Admin'] })
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateAgentStatusDto,
    @Req() request: Request,
  ): Promise<StandardApiResponse<Agent>> {
    const data = await this.agentService.updateStatus(
      id,
      updateDto,
      request
    );

    return new StandardApiResponse(HttpStatus.OK, ResponseMessage.UPDATED, data);
  }

  @Patch(':id')
  @ApiHeader(OpenApiHelper.userIdHeader)
  @ApiResponse(OpenApiHelper.responseDoc)
  async updateOne(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAgentDto,
  ): Promise<StandardApiResponse<Agent>> {
    const data = await this.agentService.updateOne({ id, ...dto });
    return new StandardApiResponse(
      HttpStatus.OK,
      ResponseMessage.FETCHED,
      data,
    );
  }

  // @Delete(':id')
  // @ApiHeader(OpenApiHelper.userIdHeader)
  // //@Roles([AgentRole.ADMIN])
  // @ApiOperation({ summary: '', tags: ['Admin'] })
  // @ApiResponse(OpenApiHelper.nullResponseDoc)
  // async remove(
  //   @Param('id', ParseIntPipe) id: number): Promise<StandardApiResponse<void>> {
  //   await this.agentService.remove(id);
  //   return new StandardApiResponse(HttpStatus.NO_CONTENT, ResponseMessage.DELETED, null);
  // }
}
