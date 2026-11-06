import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  ParseIntPipe,
  HttpStatus,
  Patch,
} from '@nestjs/common';
import { CreateAgentPocDto, UpdateAgentPocDto } from './agent-poc.dto';
import { AgentPoc } from './agent-poc.entity';
import { AgentPocService } from './agent-poc.service';
import OpenApiHelper from '../common/OpenApiHelper';
import { ApiHeader, ApiResponse, ApiTags } from '@nestjs/swagger';
import { StandardApiResponse } from '../common/common.dto';
import { ResponseMessage } from '../common/common.enum';
import { SwaggerAuth } from '@qshelter/nest-auth';

@SwaggerAuth()
@Controller('agent-pocs')
@ApiTags('Agent Point of Contact')
@ApiHeader(OpenApiHelper.userIdHeader)
@ApiResponse(OpenApiHelper.responseDoc)
export class AgentPocController {
  constructor(
    private readonly agentPocService: AgentPocService,
  ) { }

  @Post()
  async create(
    @Body() createDto: CreateAgentPocDto,
  ): Promise<StandardApiResponse<AgentPoc>> {
    const data = await this.agentPocService.create(createDto);
    return new StandardApiResponse(HttpStatus.CREATED, ResponseMessage.CREATED, data);
  }

  @Get()
  async findAll(): Promise<StandardApiResponse<AgentPoc[]>> {
    const data = await this.agentPocService.findAll();
    return new StandardApiResponse(HttpStatus.OK, ResponseMessage.FETCHED, data);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<StandardApiResponse<AgentPoc>> {
    const data = await this.agentPocService.findOne(id);
    return new StandardApiResponse(HttpStatus.OK, ResponseMessage.FETCHED, data);
  }

  @Patch(':id')
  async updateOne(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateAgentPocDto,
  ): Promise<StandardApiResponse<AgentPoc>> {
    const data = await this.agentPocService.updateOne(id, updateDto);
    return new StandardApiResponse(HttpStatus.OK, ResponseMessage.UPDATED, data);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<StandardApiResponse<void>> {
    await this.agentPocService.remove(id);
    return new StandardApiResponse(HttpStatus.NO_CONTENT, ResponseMessage.DELETED, null);
  }
}
