import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AgentPoc } from './agent-poc.entity';
import {
  CreateAgentPocDto,
  UpdateAgentPocDto,
} from './agent-poc.dto';

@Injectable()
export class AgentPocService {
  constructor(
    @InjectRepository(AgentPoc, 'agent')
    private readonly agentPocRepository: Repository<AgentPoc>,
  ) { }

  async create(
    createAgentPocDto: CreateAgentPocDto,
  ): Promise<AgentPoc> {
    try {
      const { agentId, ...rest } = createAgentPocDto
      const entity = this.agentPocRepository.create({
        agent: { id: agentId },
        ...rest
      });

      return await this.agentPocRepository.save(entity);
    } catch (error) {
      if (!error['code'] || error['code'] !== 'ER_DUP_ENTRY') {
        throw error
      }

      const { agentId, ...updateDto } = createAgentPocDto

      const existingPoc = await this.agentPocRepository.findOneBy({
        agent: { id: agentId }
      })

      return this.updateOne(existingPoc.id, updateDto)
    }
  }

  async findAll(): Promise<AgentPoc[]> {
    return this.agentPocRepository.find();
  }

  findOne(id: number): Promise<AgentPoc> {
    return this.agentPocRepository.findOneBy({ id: id });
  }

  findByAgent(id: number): Promise<AgentPoc> {
    return this.agentPocRepository.findOneBy({ agentId: id });
  }

  async updateOne(
    id: number,
    updateDto: UpdateAgentPocDto,
  ): Promise<AgentPoc> {
    const agent = await this.agentPocRepository.findOneBy({ id });

    if (!agent) {
      throw new NotFoundException(
        `${AgentPoc.name} with ID ${id} not found`,
      );
    }

    this.agentPocRepository.merge(agent, updateDto);
    return this.agentPocRepository.save(agent);
  }

  async remove(id: number): Promise<void> {
    await this.agentPocRepository.delete(id);
  }
}
