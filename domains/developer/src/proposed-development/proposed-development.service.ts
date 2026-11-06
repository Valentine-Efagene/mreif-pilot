import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ProposedDevelopment } from './proposed-development.entity';
import { ProposedDevelopmentRepository } from './proposed-development.repository';
import {
  CreateProposedDevelopmentDto,
  DeclineProposedDevelopmentDto,
  ProposedDevelopmentQueryDto,
  UpdateOnboardingStageDto,
  UpdateProposedDevelopmentDto,
  UpdateProposedDevelopmentStatusDto,
} from './proposed-development.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { OnboardingStageName, ProjectType, ProposedDevelopmentApprovalStatus } from './proposed-development.enums';
import DateHelper from '../common/helpers/DateHelper';
import {
  //FilterOperator,
  //FilterSuffix,
  PaginateQuery,
  paginate,
  Paginated,
} from 'nestjs-paginate';
import { Between, FindOptionsWhere, LessThanOrEqual, Raw, Repository, MoreThanOrEqual } from 'typeorm';
import { ProjectWithPropertyTypes } from './proposed-development.type';
import { ProposedDevelopmentDocument } from '../proposed-development-document/proposed-development-document.entity';
import { DocumentStatus } from '../common/common.type';
import { ApprovalStatus, ErrorMessage } from '../common/common.enum';
import { NotificationService } from '../notification/notification.service';
import { App } from '../notification/notification.enums';
import {
  AdminDeveloperProjectApplicationDto,
  DeveloperProjectApplicationApprovalDto,
  DeveloperProjectApplicationDeclinedDto,
  DeveloperProjectApplicationSubmissionDto,
  INotificationResponse
} from '../notification/notification.dto';
import { DeveloperService } from '../developer/developer.service';
import TypeHelper from '../common/helpers/TypeHelper';
import { WithOwner } from '../common/common.entity';
import { UserService } from '../user/user.service';
import EnvironmentHelper from '../common/helpers/EnvironmentHelper';
import { AuthHelper, Role } from '@qshelter/nest-auth';
import { defaultProposedDevelopmentOnboardingStages } from '../common/common.constants';
import { ProposedPropertyService } from '../proposed-property/proposed-property.service';
import StringHelper from '../common/helpers/StringHelper';
import { S3UploaderService } from '../s3-uploader/s3-uploader.service';
import { Request } from 'express';

@Injectable()
export class ProposedDevelopmentService extends WithOwner {
  private app: App
  private readonly logger = new Logger(ProposedDevelopmentService.name);

  constructor(
    @InjectRepository(ProposedDevelopment, 'developer')
    private readonly proposedDevelopmentRepository: ProposedDevelopmentRepository,

    private readonly proposedPropertyService: ProposedPropertyService,

    @InjectRepository(ProposedDevelopmentDocument, 'developer')
    private readonly proposedDevelopmentDocumentRepository: Repository<ProposedDevelopmentDocument>,
    private readonly notificationService: NotificationService,
    private readonly developerService: DeveloperService,
    private readonly s3UploaderService: S3UploaderService,
    private readonly userService: UserService,
  ) {
    super();
    this.app = TypeHelper.toEnum(App, process.env.app)
  }
  async getTotalGdv(): Promise<number> {
    const sum = await this.proposedDevelopmentRepository.sum('gdv');
    return sum
  }

  async create(
    createProposedDevelopmentDto: CreateProposedDevelopmentDto,
    request: Request
  ): Promise<ProposedDevelopment> {
    const { developerId, proposedProperties, ...rest } = createProposedDevelopmentDto;
    const developer = await this.developerService.findOne(developerId)

    if (developer.status != ApprovalStatus.APPROVED) {
      throw new BadRequestException('This developer has not been approved.')
    }

    if (createProposedDevelopmentDto.proposedProperties && createProposedDevelopmentDto.nUnitsPresoldOrCommited) {
      const totalUnits = createProposedDevelopmentDto.proposedProperties?.reduce((prev, curr) => {
        return prev + (curr.nUnits || 0)
      }, 0)

      if (createProposedDevelopmentDto.nUnitsPresoldOrCommited && createProposedDevelopmentDto.nUnitsPresoldOrCommited > totalUnits) {
        throw new BadRequestException('Properties seem to be oversold')
      }
    }

    const proposedDevelopment = await this.proposedDevelopmentRepository.save({
      developer: { id: developerId },
      ...rest,
      onBoardingStages: rest.onBoardingStages ?? defaultProposedDevelopmentOnboardingStages
    });

    if (proposedProperties && proposedProperties.length > 0) {
      const createManyProposedPropertiesDto = proposedProperties.map(
        (createProposedPropertyDto) => {
          return {
            proposedDevelopment: { id: proposedDevelopment.id },
            ...createProposedPropertyDto,
          };
        },
      );

      await this.proposedPropertyService.createMany({
        proposedDevelopmentId: proposedDevelopment.id,
        proposedProperties: createManyProposedPropertiesDto
      });
    }

    if (createProposedDevelopmentDto.type === ProjectType.COMPLETED) {
      await this.updateOnboardingStage(proposedDevelopment.id, {
        stageName: OnboardingStageName.PROJECT_VIABILITY,
        completed: true,
      }, request)
    }

    // If we have proposedProperties, fetch the complete entity with relations
    if (proposedProperties && proposedProperties.length > 0) {
      return this.proposedDevelopmentRepository.findOne({
        where: { id: proposedDevelopment.id },
        relations: ['proposedProperties'],
      });
    }

    // Otherwise return the saved entity (no need for extra DB call)
    return proposedDevelopment;
  }

  async sendApplicationSubmissionEmail(proposedDevelopment: ProposedDevelopment, request: Request) {
    try {
      const mailDtos = await this.getMailList(proposedDevelopment)
      const promises: any = []

      for (let index = 0; index < mailDtos.length; index++) {
        const contact = mailDtos[index]

        if (!contact.email || !contact.name) {
          continue
        }

        const emailDto: DeveloperProjectApplicationSubmissionDto = {
          developerName: contact.name,
          app: this.app,
          to_email: contact.email,
          projectName: proposedDevelopment.name,
          projectType: StringHelper.stripUnderscores(proposedDevelopment.type),
          date: proposedDevelopment.createdAt.toLocaleString(),
          numberOfUnits: this.countUnits(proposedDevelopment),
          projectLocation: proposedDevelopment.proposedLocation ?? 'Unknown Proposed Location'
        };
        promises.push(this.notificationService.sendProjectApplicationSubmission(emailDto, request))
      }

      try {
        const responses = await Promise.all(promises)
        this.logger.log('Email Responses:', responses)
      } catch (error) {
        this.logger.error(error)
      }
    } catch (error) {
      this.logger.error(error)
    }
  }

  countUnits(project: ProposedDevelopment) {
    return project.proposedProperties?.reduce((prev, curr) => {
      return prev + (curr.nUnits || 0)
    }, 0)
  }

  async sendAdminApplicationSubmissionEmail(proposedDevelopment: ProposedDevelopment, request: Request, developer?: any) {

    try {
      // Use provided developer or fetch it
      const developerData = developer || await this.developerService.findOneWithUserAndPoc(proposedDevelopment.developerId)

      if (!developerData) {
        throw new BadRequestException('Developer not found')
      }

      const mailDtos = await this.getAdminMailList(proposedDevelopment)
      const promises: any = []

      for (let index = 0; index < mailDtos.length; index++) {
        const contact = mailDtos[index]

        if (!contact.email || !contact.name) {
          continue
        }

        const emailDto: AdminDeveloperProjectApplicationDto = {
          developerName: developerData?.businessName,
          app: this.app,
          to_email: contact.email,
          developerEmail: developerData?.user?.email,
          developerPhoneNumber: developerData?.user?.phone,
          projectStatus: proposedDevelopment.status,
          projectType: proposedDevelopment.type,
          projectLocation: proposedDevelopment?.proposedLocation,
          numberOfUnits: this.countUnits(proposedDevelopment),
          adminLoginLink: EnvironmentHelper.env.admin_dashboard_url,
        };

        promises.push(this.notificationService.sendAdminProjectApplicationSubmission(emailDto, request))
      }

      try {
        const responses = await Promise.all(promises)
        this.logger.log('Email Responses:', responses)
      } catch (error) {
        this.logger.error(error)
      }
    } catch (error) {
      this.logger.error(error)
    }
  }

  async findAll(request: Request): Promise<ProposedDevelopment[]> {
    const isProjectManager = AuthHelper.isAuthorized(request, [Role.PROJECT_MANAGER])
    const isMofiAdmin = AuthHelper.isAuthorized(request, [Role.MOFI_ADMIN])

    if (isProjectManager) {
      return this.proposedDevelopmentRepository.find({
        order: {
          id: 'DESC'
        },
        where: {
          type: ProjectType.COMPLETED
        }
      });
    }

    if (isMofiAdmin) {
      return this.proposedDevelopmentRepository.find({
        order: {
          id: 'DESC'
        },
        where: {
          type: ProjectType.OFF_PLAN
        }
      });
    }

    return this.proposedDevelopmentRepository.find({
      order: {
        id: 'DESC'
      }
    });
  }

  async findAllByDateRange(start: Date, end: Date): Promise<ProposedDevelopment[]> {
    return this.proposedDevelopmentRepository.find({
      where: {
        createdAt: Between(start, end)
      },
      relations: ['developer']
    });
  }

  findOne(id: number): Promise<ProposedDevelopment> {
    return this.proposedDevelopmentRepository.findOne({
      where: {
        id,
      },
      loadEagerRelations: true,
      relations: ['developer', 'proposedProperties'],
    });
  }

  async getOwnerId(id: number | null): Promise<number> {
    if (!id) {
      return null
    }

    const data = await this.proposedDevelopmentRepository.findOne({
      where: {
        id,
      },
      loadEagerRelations: true,
      relations: ['developer'],
    });

    return data?.developer?.userId
  }

  /**
 * @deprecated This method is deprecated and will be removed in future versions.
 * Use {@link #findAllPaginated()} instead.
 */
  findAllByDeveloper(id: number): Promise<ProposedDevelopment[]> {
    const proposedDevelopments = this.proposedDevelopmentRepository.find({
      where: {
        developer: { id },
      },
      order: {
        id: 'DESC'
      }
    });
    return proposedDevelopments;
  }

  async updateOne(
    id: number,
    updateDto: UpdateProposedDevelopmentDto,
  ): Promise<ProposedDevelopment> {
    const proposedDevelopment =
      await this.proposedDevelopmentRepository.findOne({
        where: {
          id
        },
        relations: ['proposedProperties']
      });

    if (!proposedDevelopment) {
      throw new NotFoundException(
        `${ProposedDevelopment.name} with ID ${id} not found`, //
      );
    }

    const totalUnits = this.countUnits(proposedDevelopment)

    if (updateDto.nUnitsPresoldOrCommited && updateDto.nUnitsPresoldOrCommited > totalUnits) {
      throw new BadRequestException('Properties seem to be oversold')
    }

    this.proposedDevelopmentRepository.merge(proposedDevelopment, updateDto);
    return this.proposedDevelopmentRepository.save(proposedDevelopment);
  }

  verifyDocumentsApproved(documents: ProposedDevelopmentDocument[]): boolean {
    const unapproved = documents?.filter(doc => doc.status !== DocumentStatus.APPROVED)

    return unapproved?.length === 0
  }

  async getMailList(proposedDevelopmentId: number): Promise<{ name: string, email: string }[]>;
  async getMailList(proposedDevelopment: ProposedDevelopment): Promise<{ name: string, email: string }[]>;
  async getMailList(proposedDevelopmentOrId: number | ProposedDevelopment): Promise<{ name: string, email: string }[]> {
    let proposedDev: ProposedDevelopment;

    if (typeof proposedDevelopmentOrId === 'number') {
      proposedDev = await this.findOne(proposedDevelopmentOrId);
      if (!proposedDev) {
        throw new BadRequestException('Project not found');
      }
    } else {
      proposedDev = proposedDevelopmentOrId;
    }

    const developer = await this.developerService.findOneWithUserAndPoc(proposedDev.developerId)

    if (!developer) {
      throw new BadRequestException('Developer not found')
    }

    return [{
      name: developer.user.firstName,
      email: developer.user.email,
    }]
  }

  async getAdminMailList(proposedDevelopmentId: number): Promise<{ name: string, email: string }[]>;
  async getAdminMailList(proposedDevelopment: ProposedDevelopment): Promise<{ name: string, email: string }[]>;
  async getAdminMailList(proposedDevelopmentOrId: number | ProposedDevelopment): Promise<{ name: string, email: string }[]> {
    let proposedDev: ProposedDevelopment;

    if (typeof proposedDevelopmentOrId === 'number') {
      proposedDev = await this.findOne(proposedDevelopmentOrId);
      if (!proposedDev) {
        throw new BadRequestException('Project not found');
      }
    } else {
      proposedDev = proposedDevelopmentOrId;
    }

    const personsOfInterest = proposedDev.type === ProjectType.COMPLETED ?
      await this.userService.findAllProjectManagers() :
      await this.userService.findAllMofiAdmins()

    const mailList: { name: string, email: string }[] = personsOfInterest.map(({ email, firstName }) => {
      return {
        email,
        name: firstName
      }
    })

    return mailList
  }

  async updateStatus(
    id: number,
    updateDto: UpdateProposedDevelopmentStatusDto,
    request: Request
  ): Promise<ProposedDevelopment> {
    if (updateDto.status === ProposedDevelopmentApprovalStatus.DECLINED) {
      return this.decline(id, updateDto, request)
    }

    updateDto.declineReason = null

    const proposedDevelopment =
      await this.proposedDevelopmentRepository.findOne({
        where: {
          id,
        },
        relations: ['proposedDevelopmentDocuments']
      });

    if (!proposedDevelopment) {
      throw new NotFoundException(
        `${ProposedDevelopment.name} with ID ${id} not found`,
      );
    }

    if (updateDto.status === ProposedDevelopmentApprovalStatus.APPROVED) {
      if (proposedDevelopment?.proposedDevelopmentDocuments?.length < 1) {
        throw new BadRequestException('Documents are required')
      }

      if (!this.verifyDocumentsApproved(proposedDevelopment.proposedDevelopmentDocuments)) {
        throw new BadRequestException(ErrorMessage.DOCUMENTS_NOT_APPROVED)
      }

      if (proposedDevelopment.onBoardingStages?.[proposedDevelopment?.onBoardingStages.length - 1]?.completed === false) {
        throw new BadRequestException("Please complete the onboarding")
      }
    }

    const { reviewerId } = updateDto;

    this.proposedDevelopmentRepository.merge(proposedDevelopment, {
      ...updateDto,
      reviewer: { id: reviewerId },
      reviewedAt: new Date().toISOString(),
    });
    const response = this.proposedDevelopmentRepository.save(proposedDevelopment);

    if (updateDto.status == ProposedDevelopmentApprovalStatus.APPROVED) {
      try {
        const mailDtos = await this.getMailList(proposedDevelopment)
        const promises: Promise<INotificationResponse>[] = []

        for (let index = 0; index < mailDtos.length; index++) {
          const contact = mailDtos[index]

          if (!contact.email || !contact.name) {
            continue
          }

          const emailDto: DeveloperProjectApplicationApprovalDto = {
            developerName: contact.name,
            app: this.app,
            to_email: contact.email,
            projectName: proposedDevelopment.name,
            projectType: StringHelper.stripUnderscores(proposedDevelopment.type),
            applicationNumber: proposedDevelopment.id!,
            date: proposedDevelopment.createdAt.toLocaleString(),
            numberOfUnits: this.countUnits(proposedDevelopment),
          };
          promises.push(this.notificationService.sendProjectApplicationApproval(emailDto, request))
        }

        try {
          const responses = await Promise.all(promises)
          this.logger.log('Email Responses:', responses)
        } catch (error) {
          this.logger.error(error)
        }
      } catch (error) {
        this.logger.error(error)
      }
    }

    return response
  }

  async decline(
    id: number,
    updateDto: DeclineProposedDevelopmentDto,
    request: Request
  ): Promise<ProposedDevelopment> {
    if (!updateDto.declineReason || updateDto.declineReason.length < 1) {
      throw new BadRequestException(ErrorMessage.NO_REASON_DECLINE)
    }

    const proposedDevelopment =
      await this.proposedDevelopmentRepository.findOne({
        where: {
          id,
        },
        relations: ['proposedDevelopmentDocuments']
      });

    if (!proposedDevelopment) {
      throw new NotFoundException(
        `${ProposedDevelopment.name} with ID ${id} not found`,
      );
    }

    const { reviewerId } = updateDto;

    const affectedDocuments = proposedDevelopment.proposedDevelopmentDocuments
      ?.filter(doc => doc.status !== DocumentStatus.APPROVED)
      ?.map(doc => doc.name)

    this.proposedDevelopmentRepository.merge(proposedDevelopment, {
      ...updateDto,
      affectedDocuments,
      reviewer: { id: reviewerId },
      reviewedAt: new Date().toISOString(),
      status: ProposedDevelopmentApprovalStatus.DECLINED,
    });

    const response = this.proposedDevelopmentRepository.save(proposedDevelopment);

    try {
      const mailList = await this.getMailList(proposedDevelopment)
      const promises: any = []

      for (let index = 0; index < mailList.length; index++) {
        const contact = mailList[index]

        if (!contact.email || !contact.name) {
          continue
        }

        const emailDto: DeveloperProjectApplicationDeclinedDto = {
          developerName: contact.name,
          app: this.app,
          to_email: contact.email,
          reason: updateDto.declineReason,
          projectName: proposedDevelopment.name,
          projectType: StringHelper.stripUnderscores(proposedDevelopment.type),
          date: proposedDevelopment.createdAt.toLocaleString()
        };
        promises.push(this.notificationService.sendProjectApplicationDeclined(emailDto, request))
      }

      try {
        const responses = await Promise.all(promises)
        this.logger.log('Email Responses:', responses)
      } catch (error) {
        this.logger.error(error)
      }
    } catch (error) {
      this.logger.error(error)
    }

    return response
  }

  async findAllPaginated(
    request: Request,
    paginateQuery: PaginateQuery,
    query: ProposedDevelopmentQueryDto
  ): Promise<Paginated<ProposedDevelopment>> {
    let whereClause: FindOptionsWhere<ProposedDevelopment> | FindOptionsWhere<ProposedDevelopment>[] = undefined
    let hideIncomplete = false

    if (query['hideIncomplete']) {
      hideIncomplete = query['hideIncomplete'] === 'true'
    }

    if (hideIncomplete) {
      whereClause = {
        onBoardingStages: Raw(
          (alias) => `
          JSON_UNQUOTE(JSON_EXTRACT(${alias}, CONCAT('$[', JSON_LENGTH(${alias}) - 1, '].completed'))) = 'true'
        `
        ),
      }
    }

    if (query.endDate && !query.startDate) {
      const endDate = new Date(query.endDate)

      if (isNaN(endDate.getTime())) {
        throw new BadRequestException('Invalid end date format')
      }

      whereClause = {
        ...whereClause,
        createdAt: LessThanOrEqual(new Date(query.endDate))
      }
    }

    if (query.startDate && !query.endDate) {
      const startDate = new Date(query.startDate)

      if (isNaN(startDate.getTime())) {
        throw new BadRequestException('Invalid start date format')
      }

      whereClause = {
        ...whereClause,
        createdAt: MoreThanOrEqual(new Date(query.startDate))
      }
    }

    if (query.startDate && query.endDate) {
      const startDate = new Date(query.startDate)
      const endDate = new Date(query.endDate)

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new BadRequestException('Invalid date format')
      }

      endDate.setHours(23, 59, 59, 999)

      whereClause = {
        ...whereClause,
        createdAt: Between(startDate, endDate)
      }
    }

    if (query.developerId) {
      const developer = await this.developerService.findOne(query.developerId)

      const isAuthorized = AuthHelper.isOneOfRolesAdminOrOwner(request, developer?.userId,
        [
          Role.SUPPORT,
          Role.SUPER_ADMIN,
          Role.SALES,
          Role.MOFI_ADMIN,
          Role.MORTGAGE_OPERATOR,
        ])

      if (!isAuthorized) {
        throw new BadRequestException('You are not authorized to view this developer\'s projects')
      }

      whereClause = {
        ...whereClause,
        developer: { id: query.developerId },
      }
    }

    if (query.state) {
      whereClause = {
        ...whereClause,
        state: query.state,
      }
    }

    if (AuthHelper.isAuthorized(request, [
      Role.PROJECT_MANAGER,
      Role.SALES,
    ])) {
      whereClause = {
        ...whereClause,
        type: ProjectType.COMPLETED,
      }
    } else if (AuthHelper.isAuthorized(request, [Role.MOFI_ADMIN])) {
      whereClause = {
        ...whereClause,
        type: ProjectType.OFF_PLAN,
      }
    }

    this.logger.debug('Final whereClause:', whereClause);

    return paginate(paginateQuery, this.proposedDevelopmentRepository, {
      sortableColumns: ['id', 'createdAt', 'updatedAt'],
      //nullSort: 'last',
      defaultSortBy: [['id', 'DESC']],
      loadEagerRelations: true,
      where: whereClause,
      relations: ['developer', 'proposedProperties'],
      searchableColumns: ['proposedLocation', 'state', 'developer.businessName'],
      //select: ['id'],
      filterableColumns: {
        //name: [FilterOperator.EQ, FilterSuffix.NOT],
        state: true,
        status: true,
        type: true,
        createdAt: true
      },
    });
  }

  async remove(id: number): Promise<void> {
    const proposedDevelopment = await this.findOne(id);
    const documentDbDeletionPromises = []
    const documentFileDeletionPromises = []

    if (proposedDevelopment.proposedDevelopmentDocuments?.length > 0) {
      proposedDevelopment.proposedDevelopmentDocuments.forEach((document) => {
        documentDbDeletionPromises.push(this.proposedDevelopmentDocumentRepository.remove(document))
        documentFileDeletionPromises.push(this.s3UploaderService.deleteFromS3(document.url))
      });
    }

    try {
      await Promise.allSettled(documentDbDeletionPromises)
    } catch (error) {
      this.logger.error('Error while clearing project documents:', error)
    }

    try {
      await Promise.allSettled(documentFileDeletionPromises)
    } catch (error) {
      this.logger.error('Error while deleting project documents from storage:', error)
    }

    await this.proposedDevelopmentRepository.delete(id);
  }

  async updateOnboardingStage(id: number, updateDto: UpdateOnboardingStageDto, request: Request) {
    const developer = await this.findOne(id);

    if (!developer) {
      throw new NotFoundException(`Developer with ID ${id} not found`);
    }

    const onboardingStages = developer.onBoardingStages;

    const updatedOnboardingStages = onboardingStages.map((stage) => {
      if (stage.name === updateDto.stageName) {
        const now = new Date();
        const nowIso = DateHelper.formatDateToYYYYMMDD(now.toISOString());
        stage.completedAt = nowIso;
        stage.completed = updateDto.completed;
        stage.isCurrent = true
      } else {
        stage.isCurrent = false
      }

      return stage;
    });

    this.proposedDevelopmentRepository.merge(developer, {
      onBoardingStages: updatedOnboardingStages,
    });

    const proposedDevelopment = await this.proposedDevelopmentRepository.save(developer);

    if (updateDto.stageName === OnboardingStageName.PROJECT_VIABILITY && updateDto.completed) {
      await this.sendApplicationSubmissionEmail(proposedDevelopment, request)
      await this.sendAdminApplicationSubmissionEmail(proposedDevelopment, request)
    }

    return proposedDevelopment
  }

  async getStats(): Promise<Record<string, number>> {
    const all = await this.proposedDevelopmentRepository.count();
    const pending = await this.proposedDevelopmentRepository
      .createQueryBuilder()
      .where("status = :status", { status: 'PENDING' })
      .getCount();
    const declined = await this.proposedDevelopmentRepository.createQueryBuilder()
      .where("status = :status", { status: 'DECLINED' })
      .getCount();
    const approved = await this.proposedDevelopmentRepository.createQueryBuilder()
      .where("status = :status", { status: 'APPROVED' })
      .getCount();
    const totalGdv = await this.getTotalGdv()

    return { all, pending, declined, approved, totalGdv }
  }

  async getStatesWithProjects(): Promise<{ state: string, projects: ProjectWithPropertyTypes[] }[]> {
    const projects = await this.proposedDevelopmentRepository.
      createQueryBuilder('project')
      .leftJoin('project.proposedProperties', 'proposedProperties')
      .select([
        'project.id',
        'project.city',
        'project.state',
        'project.proposedLocation',
        'project.status',
        'project.nameOnCOfO',
        'project.gdv',
        'project.developerId',
        'proposedProperties',
      ])
      .orderBy('project.state')
      .getMany();

    const groupedProjects = {};

    for (const project of projects) {
      const projectWithTypes = { ...project, propertyTypes: [] };
      //const properties = await this.proposedPropertyService.findAllByProposedDevelopment(project.id);
      const properties = projectWithTypes.proposedProperties
      const propertyTypes = properties.map((property) => property.type);

      projectWithTypes.propertyTypes = [...(new Set(propertyTypes))];

      if (!groupedProjects[project.state]) {
        groupedProjects[project.state] = [];
      }
      groupedProjects[project.state].push(projectWithTypes);
    }

    return Object.keys(groupedProjects).map(state => ({
      state,
      projects: groupedProjects[state],
    }));
  }
}
