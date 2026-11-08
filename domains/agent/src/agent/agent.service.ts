import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreateAgentDto, PaginatedAgents, ReferreePaginationDto, UpdateAgentStatusDto } from './agent.dto';
import { Agent } from './agent.entity';
import { UpdateAgentDto } from './agent.dto';
import {
  //FilterOperator,
  //FilterSuffix,
  PaginateQuery,
  paginate,
  Paginated,
} from 'nestjs-paginate';
import { PaginationArgs } from '../common/common.dto';
import CryptographyHelper from '../common/helpers/CryptographyHelper';
import { CommissionService } from '../commission/commission.service';
import { LicensingInfo } from '../licensing-info/licensing-info.entity';
import { LicensingDocument } from '../licensing-document/licensing-document.entity';
import { User } from '../user/user.entity';
import { UserService } from '../user/user.service';
import { PaginatedUsers } from '../user/user.dto';
import { AgentCommissionPaginationDto, PaginatedAgentCommissions } from '../commission/commission.dto';
import { LicensingDocumentService } from '../licensing-document/licensing-document.service';
import { Status } from '../common/common.type';
import { ErrorMessage } from '../common/common.enum';
import { AgentApprovedRegistrationDto, AgentOnboardingCompletedDto } from '../notification/notification.dto';
import { App } from '../notification/notification.enums';
import TypeHelper from '../common/helpers/TypeHelper';
import { NotificationService } from '../notification/notification.service';
import EnvironmentHelper from '../common/helpers/EnvironmentHelper';
import { Request } from 'express';
import { AgentPoc } from '../agent-poc/agent-poc.entity';

// https://www.npmjs.com/package/nestjs-paginate
@Injectable()
export class AgentService {
  private app: App
  private readonly logger = new Logger(AgentService.name);

  constructor(
    @InjectRepository(Agent, 'agent')
    private readonly agentRepository: Repository<Agent>,
    private readonly commissionService: CommissionService,
    private readonly userService: UserService,
    private readonly licensingDocumentService: LicensingDocumentService,
    private readonly notificationService: NotificationService,
    @InjectDataSource('agent')
    private dataSource: DataSource,
  ) {
    this.app = TypeHelper.toEnum(App, process.env.APP)
  }

  async create(createAgentDto: CreateAgentDto, request: Request): Promise<Agent> {
    const { licensingInfo: licensingInfoDto, poc, ...rest } = createAgentDto;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const user = await this.dataSource
      .createQueryBuilder()
      .select('user')
      .from(User, 'user')
      .where('user.id = :id', { id: createAgentDto.userId })
      .getOne();

    if (!user) {
      throw new BadRequestException(`User with ID ${createAgentDto.userId} not found`);
    }

    const referralCode = CryptographyHelper.generateReferralCode(user.email, user, 5);

    try {
      const agent = new Agent({
        ...rest,
        referralCode,
      })
      await queryRunner.manager.save(agent)

      if (licensingInfoDto) {
        const promises = [];

        for (const doc of licensingInfoDto) {
          const licensingInfo = new LicensingInfo();
          licensingInfo.agentId = agent.id;
          licensingInfo.regulatoryBody = doc.regulatoryBody;
          const persistedInfo = await queryRunner.manager.save(licensingInfo);

          const document = new LicensingDocument();
          document.name = doc.regulatoryBody;
          document.url = doc.url;
          document.licensingInfoId = persistedInfo.id;
          promises.push(queryRunner.manager.save(document));
        }

        await Promise.all(promises);
      }

      if (poc) {
        const entity = new AgentPoc();
        Object.assign(entity, {
          ...poc,
          agentId: agent.id
        })
        await queryRunner.manager.save(entity);
      }

      await queryRunner.commitTransaction();
      const response: Agent = await this.agentRepository.findOne({
        where: {
          id: agent.id,
        },
        relations: ['poc', 'licensingInfo']
      })

      try {
        const emailDto: AgentOnboardingCompletedDto = {
          firstName: user.firstName,
          app: this.app,
          to_email: user.email,
        };
        await this.notificationService.sendAgentOnboardingCompleted(emailDto, request);
      } catch (error) {
        console.log('Error sending notification email:', error);
      }

      return response;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(): Promise<Agent[]> {
    return this.agentRepository.find();
  }

  async findLicensingDocumentsByAgentId(agentId: number): Promise<LicensingDocument[]> {
    return this.licensingDocumentService.findAllByAgent(agentId);
  }

  findAllPaginated(query: PaginateQuery): Promise<Paginated<Agent>> {
    return paginate(query, this.agentRepository, {
      sortableColumns: ['id', 'createdAt', 'updatedAt'],
      //nullSort: 'last',
      defaultSortBy: [['id', 'DESC']],
      searchableColumns: [],
      //select: ['id'],
      filterableColumns: {
        //name: [FilterOperator.EQ, FilterSuffix.NOT],
        //age: true,
      },
    });
  }

  // findAllReferreesPaginated(query: PaginateQuery, agentId: number): Promise<Paginated<User>> {
  //   return this.referralService.findAllPaginatedByAgent(query, agentId);
  // }

  async getReferreesByAgent(agentId: number): Promise<User[]> {
    const agent = this.agentRepository.findOne({
      where: { id: agentId },
      relations: ['referrals'],
    });

    return await this.agentRepository
      .createQueryBuilder('agent')
      .leftJoin('agent.referrals', 'referral') // Join referrals table
      .leftJoinAndSelect('referral.referree', 'referree') // Join and select referees (users)
      .where('agent.id = :agentId', { agentId }) // Filter by agentId
      .select(['referree.id', 'referree.name', 'referree.email']) // Select required fields from the User entity
      .getMany() as unknown as Promise<User[]>;
  }

  async findOne(id: number): Promise<Agent> {
    const agent = this.agentRepository.findOne({
      where: { id },
      relations: ['licensingInfo', 'poc'],
    });

    if (!agent) {
      throw new NotFoundException(`${Agent.name} with ID ${id} not found`);
    }

    return agent;
  }

  async findOneByUser(id: number): Promise<Agent> {
    const agent = this.agentRepository.findOne({
      where: {
        user: { id },
      },
      relations: ['licensingInfo', 'poc'],
    });
    return agent;
  }

  async findOneByReferralCode(referralCode: string): Promise<Agent> {
    const agent = this.agentRepository.findOne({
      where: {
        referralCode,
      },
    });
    return agent;
  }

  async updateStatus(
    id: number,
    updateDto: UpdateAgentStatusDto,
    request: Request
  ): Promise<Agent> {
    if (
      updateDto.status === Status.DECLINED &&
      !updateDto.comment
    ) {
      throw new BadRequestException(ErrorMessage.NO_REASON_DECLINE);
    }

    if (updateDto.status !== Status.DECLINED) {
      updateDto.comment = null
    }

    const agent = await this.agentRepository.findOne({
      where: {
        id,
      },
      relations: ['user'],
    });

    if (!agent) {
      throw new NotFoundException(
        `${Agent.name} with ID ${id} not found`,
      );
    }

    const { reviewerId, ...rest } = updateDto;

    this.agentRepository.merge(agent, {
      ...rest,
      reviewer: { id: reviewerId },
      reviewedAt: new Date().toISOString(),
    });

    const res = await this.agentRepository.save(agent);

    const emailDto: AgentApprovedRegistrationDto = {
      firstName: agent.user.firstName,
      app: this.app,
      to_email: agent.user.email,
      loginLink: EnvironmentHelper.env.AGENT_DASHBOARD_URL
    };

    try {
      if (updateDto.status === Status.APPROVED) {
        await this.notificationService.sendAgentApplicationApproved(emailDto, request);
      } else if (updateDto.status === Status.DECLINED) {
        await this.notificationService.sendAgentApplicationDeclined({
          ...emailDto,
          reason: updateDto.comment
        }, request);
      }
    } catch (error) {
      this.logger.error('Error sending notification email:', error);
    }

    return res;
  }

  async updateOne({ id, ...updateAgentDto }: UpdateAgentDto): Promise<Agent> {
    const agent = await this.agentRepository.findOneBy({ id });

    if (!agent) {
      throw new NotFoundException(`Agent with ID ${id} not found`);
    }

    this.agentRepository.merge(agent, updateAgentDto);
    return this.agentRepository.save(agent);
  }

  async getCommissions(query: AgentCommissionPaginationDto, agentId: number): Promise<PaginatedAgentCommissions> {
    return this.commissionService.paginateAgentCommissions(query, agentId);
  }

  async getReferrees(query: ReferreePaginationDto, agentId: number): Promise<PaginatedUsers> {
    return this.userService.paginateAgentReferrees(query, agentId);
  }

  async getTotalCommission(agentId: number): Promise<number> {
    return this.commissionService.getTotalCommissionForAgent(agentId);
  }

  async remove(id: number): Promise<void> {
    await this.agentRepository.delete(id);
  }

  async paginate(query: PaginationArgs): Promise<PaginatedAgents> {
    const [data, count] = await this.agentRepository.findAndCount({
      skip: query.page > 0 ? query.page - 1 : 1,
      take: query.limit,
    });

    return {
      data,
      meta: {
        currentPage: query.page,
        itemsPerPage: query?.limit,
        totalItems: data.length,
        totalPages: Math.ceil(count / query.limit),
      },
    };
  }
}
