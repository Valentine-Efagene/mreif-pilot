import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Patch,
  ValidationPipe,
  UsePipes,
  BadRequestException,
  HttpStatus,
  Query,
  ParseIntPipe,
  Req,
  HttpCode,
  UnauthorizedException,
} from '@nestjs/common';
import { ProposedDevelopment } from './proposed-development.entity';
import { ProposedDevelopmentService } from './proposed-development.service';
import {
  CreateProposedDevelopmentDto,
  DeclineProposedDevelopmentDto,
  ProposedDevelopmentQueryDto,
  UpdateOnboardingStageDto,
  UpdateProposedDevelopmentDto,
  UpdateProposedDevelopmentStatusDto,
} from './proposed-development.dto';
import OpenApiHelper from '../common/OpenApiHelper';
import { ApiHeader, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { StandardApiResponse } from '../common/common.dto';
import { DeveloperService } from '../developer/developer.service';
import { PaginateQuery, Paginated, Paginate } from 'nestjs-paginate';
import { ResponseMessage } from '../common/common.enum';
import { ProposedDevelopmentDocument } from '../proposed-development-document/proposed-development-document.entity';
import { SwaggerAuth, AuthHelper, Role } from '@qshelter/nest-auth';
import { ProjectType } from './proposed-development.enums';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';

@SwaggerAuth()
@Controller('proposed-developments')
@ApiTags('Proposed Development')
@ApiResponse(OpenApiHelper.responseDoc)
export class ProposedDevelopmentController {
  constructor(
    private readonly proposedDevelopmentService: ProposedDevelopmentService,

    @InjectRepository(ProposedDevelopmentDocument, 'developer')
    private readonly proposedDevelopmentDocumentRepository: Repository<ProposedDevelopmentDocument>,

    private readonly developerService: DeveloperService,
  ) { }

  @Post()
  @ApiHeader(OpenApiHelper.userIdHeader)
  async create(
    @Body() createProposedDevelopmentDto: CreateProposedDevelopmentDto,
    @Req() request: Request
  ): Promise<StandardApiResponse<ProposedDevelopment>> {
    const proposedDevelopment = await this.developerService.findOne(
      createProposedDevelopmentDto.developerId,
    );

    if (!proposedDevelopment) {
      throw new BadRequestException('Invalid developer ID');
    }

    const data = await this.proposedDevelopmentService.create(
      createProposedDevelopmentDto, request
    );
    return new StandardApiResponse(HttpStatus.CREATED, ResponseMessage.CREATED, data);
  }

  @Get()
  @ApiHeader(OpenApiHelper.userIdHeader)
  @ApiResponse(OpenApiHelper.arrayResponseDoc)
  async findAll(
    @Req() request: Request
  ): Promise<StandardApiResponse<ProposedDevelopment[]>> {
    const data = await this.proposedDevelopmentService.findAll(request);
    return new StandardApiResponse(HttpStatus.OK, ResponseMessage.FETCHED, data);
  }

  @Get('states')
  async getStatesWithProjects() {
    return this.proposedDevelopmentService.getStatesWithProjects();
  }

  @Get('stats')
  //@ApiResponse()
  @ApiHeader(OpenApiHelper.userIdHeader)
  async getStats(): Promise<StandardApiResponse<Record<string, number>>> {
    const data = await this.proposedDevelopmentService.getStats();
    return new StandardApiResponse(HttpStatus.OK, ResponseMessage.FETCHED, data);
  }

  @ApiOperation({
    summary: 'Strictly for exporting',
    description: '',
  })
  @Get('/by-date-range')
  @ApiHeader(OpenApiHelper.userIdHeader)
  @ApiResponse(OpenApiHelper.arrayResponseDoc)
  async findAllByDateRange(
    @Query('startDate') start: Date,
    @Query('endDate') end: Date
  ): Promise<StandardApiResponse<ProposedDevelopment[]>> {
    const data = await this.proposedDevelopmentService.findAllByDateRange(start, end);
    return new StandardApiResponse(HttpStatus.OK, ResponseMessage.FETCHED, data);
  }

  @Get('paginate')
  @HttpCode(HttpStatus.OK)
  @ApiHeader(OpenApiHelper.userIdHeader)
  @ApiResponse(OpenApiHelper.arrayResponseDoc)
  async findAllPaginated(
    @Req() request: Request,
    @Paginate() paginateQuery: PaginateQuery,
    @Query() query: ProposedDevelopmentQueryDto,
  ): Promise<StandardApiResponse<Paginated<ProposedDevelopment>>> {
    const data = await this.proposedDevelopmentService.findAllPaginated(request, paginateQuery, query);
    return new StandardApiResponse(HttpStatus.OK, ResponseMessage.FETCHED, data);
  }

  @Get('by-developer/:id')
  @ApiHeader(OpenApiHelper.userIdHeader)
  @ApiOperation({
    deprecated: true,
  })
  /**
* @deprecated This method is deprecated and will be removed in future versions.
* Use {@link #findAllPaginated()} instead.
*/
  async findAllByDeveloper(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<StandardApiResponse<ProposedDevelopment[]>> {
    const data = await this.proposedDevelopmentService.findAllByDeveloper(
      id,
    );
    return new StandardApiResponse(HttpStatus.OK, ResponseMessage.FETCHED, data);
  }

  @Get('by-user/:id')
  @ApiHeader(OpenApiHelper.userIdHeader)
  async findAllByUser(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<StandardApiResponse<ProposedDevelopment[]>> {
    const developer = await this.developerService.findOneByUser(id);

    const data = developer.proposedDevelopments;
    return new StandardApiResponse(HttpStatus.OK, ResponseMessage.FETCHED, data);
  }

  @Get(':id/documents')
  @ApiHeader(OpenApiHelper.userIdHeader)
  @ApiResponse(OpenApiHelper.responseDoc)
  async getCommissions(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<StandardApiResponse<ProposedDevelopmentDocument[]>> {
    const data = await this.proposedDevelopmentDocumentRepository.findBy({
      proposedDevelopmentId: id,
    });
    return new StandardApiResponse(
      HttpStatus.OK,
      ResponseMessage.FETCHED,
      data,
    );
  }

  @Get(':id')
  @ApiHeader(OpenApiHelper.userIdHeader)
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: Request
  ): Promise<StandardApiResponse<ProposedDevelopment>> {
    const data = await this.proposedDevelopmentService.findOne(id);

    if (data) {
      // Authorization for project manager and MOFI admin
      const isProjectManager = AuthHelper.isAuthorized(request, [Role.PROJECT_MANAGER])
      const isSalesAdmin = AuthHelper.isAuthorized(request, [Role.SALES])
      const isMofiAdmin = AuthHelper.isAuthorized(request, [Role.MOFI_ADMIN])

      if (isProjectManager && data.type !== ProjectType.COMPLETED) {
        throw new UnauthorizedException('Project Managers can only access completed projects');
      }

      if (isSalesAdmin && data.type !== ProjectType.COMPLETED) {
        throw new UnauthorizedException('Sales Admins can only access completed projects');
      }

      if (isMofiAdmin && data.type !== ProjectType.OFF_PLAN) {
        throw new UnauthorizedException('MOFI Admins can only access off-plan projects');
      }

      if (isMofiAdmin || isProjectManager) {
        return new StandardApiResponse(HttpStatus.OK, ResponseMessage.FETCHED, data);
      }
    }

    // Authorization for developer (owner), customer support and super admins
    const ownerId = await this.proposedDevelopmentService.getOwnerId(id)
    const isAuthorized = AuthHelper.isOneOfRolesAdminOrOwner(request, ownerId,
      [
        Role.SUPPORT,
        Role.SUPER_ADMIN,
        Role.SALES,
        Role.MORTGAGE_OPERATOR,
        Role.MOFI_ADMIN
      ])

    if (!isAuthorized) {
      throw new UnauthorizedException()
    }

    return new StandardApiResponse(HttpStatus.OK, ResponseMessage.FETCHED, data);
  }

  @Patch(':id')
  @ApiHeader(OpenApiHelper.userIdHeader)
  @UsePipes(new ValidationPipe({ transform: true }))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateProposedDevelopmentDto,
  ): Promise<StandardApiResponse<ProposedDevelopment>> {
    const data = await this.proposedDevelopmentService.updateOne(
      id,
      updateDto,
    );
    return new StandardApiResponse(HttpStatus.OK, ResponseMessage.UPDATED, data);
  }

  @HttpCode(HttpStatus.OK)
  @Post(':id/decline')
  @ApiHeader(OpenApiHelper.userIdHeader)
  //@Roles([Role.ADMIN])
  @ApiOperation({ summary: '', tags: ['Admin'] })
  @UsePipes(new ValidationPipe({ transform: true }))
  async decline(
    @Param('id', ParseIntPipe) id: number,
    @Body() declineDto: DeclineProposedDevelopmentDto,
    @Req() request: Request
  ): Promise<StandardApiResponse<ProposedDevelopment>> {
    const data = await this.proposedDevelopmentService.decline(
      id,
      declineDto,
      request
    );

    return new StandardApiResponse(HttpStatus.OK, ResponseMessage.UPDATED, data);
  }

  @HttpCode(HttpStatus.OK)
  @Post(':id/update-status')
  //@Roles([Role.ADMIN])
  @ApiHeader(OpenApiHelper.userIdHeader)
  @ApiOperation({ summary: '', tags: ['Admin'] })
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateProposedDevelopmentStatusDto,
    @Req() request: Request
  ): Promise<StandardApiResponse<ProposedDevelopment>> {
    const data = await this.proposedDevelopmentService.updateStatus(
      id,
      updateDto,
      request
    );

    return new StandardApiResponse(HttpStatus.OK, ResponseMessage.UPDATED, data);
  }

  @Delete(':id')
  @ApiHeader(OpenApiHelper.userIdHeader)
  @ApiOperation({ summary: '', tags: ['Admin'] })
  async remove(
    @Param('id', ParseIntPipe) id: number): Promise<StandardApiResponse<void>> {
    await this.proposedDevelopmentService.remove(id);
    return new StandardApiResponse(HttpStatus.NO_CONTENT, ResponseMessage.DELETED, null);
  }

  @Post(':id/update-onboarding-stage')
  //@Roles([Role.ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiHeader(OpenApiHelper.userIdHeader)
  @ApiOperation({ summary: '', tags: ['Admin'] })
  async updateOnboardingStage(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOnboardingDto: UpdateOnboardingStageDto,
    @Req() request: Request
  ): Promise<StandardApiResponse<ProposedDevelopment>> {
    const data = await this.proposedDevelopmentService.updateOnboardingStage(
      id,
      updateOnboardingDto,
      request
    );
    return new StandardApiResponse(HttpStatus.OK, ResponseMessage.UPDATED, data);
  }
}
