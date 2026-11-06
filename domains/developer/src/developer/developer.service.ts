import { BadRequestException, Injectable, Logger, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, In } from 'typeorm';
import { Developer } from './developer.entity';
import { CreateDeveloperDto, DeveloperOnboardingStage, DeveloperWithWallet, UpdateDeveloperDto, UpdateDeveloperOnboardingStageDto, UpdateDeveloperStatusDto } from './developer.dto';
import {
  //FilterOperator,
  //FilterSuffix,
  PaginateQuery,
  paginate,
  Paginated,
} from 'nestjs-paginate';
import { GroupEntity } from '../group-entity/group-entity.entity';
import { ProposedDevelopment } from '../proposed-development/proposed-development.entity';
import DateHelper from '../common/helpers/DateHelper';
import { NotificationService } from '../notification/notification.service';
import { ApprovalStatus, DocumentStatus, ErrorMessage } from '../common/common.enum';
import { AdminDeveloperCompanyRegistrationDto, DeveloperApprovedBusinessRegistrationDto, DeveloperDeclinedBusinessRegistrationDto, INotificationResponse } from '../notification/notification.dto';
import { App } from '../notification/notification.enums';
import TypeHelper from '../common/helpers/TypeHelper';
import EnvironmentHelper from '../common/helpers/EnvironmentHelper';
import { DeveloperDocument } from '../developer-document/developer-document.entity';
import { DeveloperDirectorDocument } from '../developer-director-document/developer-director-document.entity';
import { Wallet } from '../wallet/wallet.entity';
import { UserService } from '../user/user.service';
import { defaultDeveloperOnboardingStages } from '../common/common.constants';
import { DeveloperOnboardingStageName } from './developer.enums';
import { DeveloperDirector } from '../developer-director/developer-director.entity';
import { DeveloperPoc } from '../developer-poc/developer-poc.entity';
import { Request } from 'express';

const updateOnboardingStage = (onboardingStages: DeveloperOnboardingStage[], stageName: DeveloperOnboardingStageName, completed: boolean) => {
  return onboardingStages.map((stage) => {
    if (stage.name === stageName) {
      const now = new Date();
      const nowIso = DateHelper.formatDateToYYYYMMDD(now.toISOString());
      stage.completedAt = nowIso;
      stage.completed = completed;
      stage.isCurrent = true
    } else {
      stage.isCurrent = false
    }

    return stage;
  });
}

// https://www.npmjs.com/package/nestjs-paginate
@Injectable()
export class DeveloperService {
  private readonly logger = new Logger(DeveloperService.name);
  private app: App

  constructor(
    @InjectRepository(Developer, 'developer')
    private readonly developerRepository: Repository<Developer>,

    @InjectRepository(ProposedDevelopment, 'developer')
    private readonly proposedDevelopmentRepository: Repository<ProposedDevelopment>,

    @InjectRepository(Wallet, 'developer')
    private readonly walletRepository: Repository<Wallet>,

    private readonly notificationService: NotificationService,

    private readonly userService: UserService,

    private dataSource: DataSource,
  ) {
    this.app = TypeHelper.toEnum(App, process.env.app)
  }

  async create(createDeveloperDto: CreateDeveloperDto, request: Request): Promise<Developer> {
    const {
      userId,
      pocs,
      groupEntities,
      directors,
      developerDocuments,
      ...rest
    } = createDeveloperDto;

    let developer: Developer;
    const queryRunner = this.dataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const _developer = await queryRunner.manager.save(Developer, {
        user: { id: userId }, ...rest,
        onboardingStages: rest.onBoardingStages ?? defaultDeveloperOnboardingStages
      });

      let onboardingStages = _developer.onboardingStages

      if (createDeveloperDto.modeOfRegistration
        && createDeveloperDto.businessName
        && createDeveloperDto.rcNumber
        && createDeveloperDto.registeredAddress
        && createDeveloperDto.hasAuditedAccounts
        && createDeveloperDto.isSubsidiary
        && createDeveloperDto.yearsOfOperation
        && createDeveloperDto.pocs
        && createDeveloperDto.pocs.length > 0
      ) {
        onboardingStages = updateOnboardingStage(onboardingStages, DeveloperOnboardingStageName.BUSINESS_DETAILS, true)
      }

      if (groupEntities && groupEntities.length > 0) {
        const _groupEntities = groupEntities.map((groupEntity) => {
          return {
            ...groupEntity,
            developer: { id: _developer.id }
          }
        })

        await queryRunner.manager.save(GroupEntity, _groupEntities);
        onboardingStages = updateOnboardingStage(onboardingStages, DeveloperOnboardingStageName.GROUP_ENTITIES, true)
      }

      if (developerDocuments && developerDocuments.length > 0) {
        const documents = developerDocuments.map((item) => {
          return {
            ...item,
            developer: { id: _developer.id }
          }
        })

        await queryRunner.manager.save(DeveloperDocument, documents);
        onboardingStages = updateOnboardingStage(onboardingStages, DeveloperOnboardingStageName.DEVELOPER_DOCUMENTS, true)
      }

      if (createDeveloperDto.bank && createDeveloperDto.accountName && createDeveloperDto.accountNumber) {
        onboardingStages = updateOnboardingStage(onboardingStages, DeveloperOnboardingStageName.BANK_INFORMATION, true)
      }

      if (directors && directors.length > 0) {
        const _directors = directors.map((item) => {
          return {
            ...item,
            developer: { id: _developer.id }
          }
        })

        const createdDirectors = await queryRunner.manager.save(DeveloperDirector, _directors);

        const _directorDocuments2d = createdDirectors?.map((director) => {
          return director?.documents?.map((document) => {
            return {
              ...document,
              developerDirector: { id: director.id }
            }
          })
        })

        const _directorDocuments = _directorDocuments2d?.reduce((acc, curr) => {
          if (curr == null) {
            return acc
          }

          return [...acc, ...curr]
        }, [])
        await queryRunner.manager.save(DeveloperDirectorDocument, _directorDocuments);

        onboardingStages = updateOnboardingStage(onboardingStages, DeveloperOnboardingStageName.DIRECTORS_FORM, true)
      }

      if (pocs && pocs.length > 0) {
        const _pocs = pocs.map((item) => {
          return {
            ...item,
            developer: { id: _developer.id }
          }
        })

        await queryRunner.manager.save(DeveloperPoc, _pocs);
      }

      if (createDeveloperDto.agreedToTerms) {
        onboardingStages = updateOnboardingStage(onboardingStages, DeveloperOnboardingStageName.TERMS_AND_CONDITION, true)
      }

      developer = queryRunner.manager.merge(Developer, _developer, {
        onboardingStages,
      });

      await queryRunner.manager.save(Developer, developer);
      await queryRunner.commitTransaction()
    } catch (error) {
      await queryRunner.rollbackTransaction()
      throw error
    }

    const user = await this.userService.findOne(userId)

    const managers = await this.userService.findAllProjectManagers()
    const mailDtos: { name: string, email: string }[] = managers.map((manager) => {
      return {
        name: manager.firstName,
        email: manager.email
      }
    })

    try {
      const promises: any = []

      for (let index = 0; index < mailDtos.length; index++) {
        const contact = mailDtos[index]

        if (!contact.email || !contact.name) {
          continue
        }


        const emailDto: AdminDeveloperCompanyRegistrationDto = {
          developerName: user.firstName,
          developerEmail: user.email,
          developerPhoneNumber: user.phone,
          companyName: developer.businessName,
          companyAddress: developer.registeredAddress,
          rcNumber: developer.rcNumber,
          adminLoginLink: EnvironmentHelper.env.admin_dashboard_url,
          app: this.app,
          to_email: contact.email
        };

        promises.push(this.notificationService.sendCompanyRegistration(emailDto, request))
      }

      try {
        const responses = await Promise.allSettled(promises)

        // Filter out failed responses
        responses.forEach((result, index) => {
          if (result.status === "fulfilled") {
            this.logger.log(`Company registration email sent to ${mailDtos[index].email}`)
          } else {
            this.logger.warn(`Company registration email failed for ${mailDtos[index].email}:`, result.reason)
          }
        })
        this.logger.log('Email Responses:', responses)
      } catch (error) {
        this.logger.error('Company registration:', error)
      }
    } catch (error) {
      this.logger.error(error)
    }

    return developer
  }

  async findAll(): Promise<Developer[]> {
    return this.developerRepository.find();
  }

  async findAllNamesOnly(): Promise<Developer[]> {
    return this.developerRepository.find(
      {
        select: ['id', 'businessName'],
        loadEagerRelations: false
      }
    );
  }

  findAllPaginated(query: PaginateQuery): Promise<Paginated<Developer>> {
    return paginate(query, this.developerRepository, {
      sortableColumns: ['id', 'createdAt', 'updatedAt'],
      //nullSort: 'last',
      defaultSortBy: [['id', 'DESC']],
      searchableColumns: ['businessName', 'user.firstName', 'user.lastName', 'user.email', 'accountName'],
      //select: ['id'],
      filterableColumns: {
        //name: [FilterOperator.EQ, FilterSuffix.NOT],
        //age: true,
      },
    });
  }

  async findOne(id: number): Promise<Developer> {
    const developer = this.developerRepository.findOne({
      where: { id },
      relations: [
        'user',
        'developerPoc',
        'developerDocuments',
        'developerDirectors',
        'groupEntities',
      ],
      select: {
        user: {
          email: true,
          phone: true,
          id: true
        }
      }
    });

    if (!developer) {
      throw new NotFoundException(`${Developer.name} with ID ${id} not found`);
    }

    return developer;
  }

  async findOneByUser(id: number): Promise<Developer> {
    const developer = this.developerRepository.findOne({
      where: {
        user: { id },
      },
      relations: [
        'proposedDevelopments',
        'developerPoc',
        'developerDocuments',
        'developerDirectors',
        'groupEntities',
      ],
    });
    return developer;
  }

  async findByUserIds(userIds: number[]): Promise<Developer[]> {
    if (!userIds || userIds.length === 0) {
      return [];
    }

    const developers = await this.developerRepository.find({
      where: {
        user: { id: In(userIds) },
      },
      select: {
        status: true,
        id: true,
        onboardingStages: true,
        userId: true
      },
      loadEagerRelations: false
    });

    return developers;
  }

  async findOneByUserWithWallet(id: number): Promise<DeveloperWithWallet> {
    const developer = await this.developerRepository.findOne({
      where: {
        user: { id },
      },
      relations: ['developerPoc']
    });

    const wallet = await this.walletRepository.findOne({
      where: {
        userId: id
      }
    })

    return {
      ...developer,
      wallet
    };
  }

  async findOneWithUserAndPoc(id: number): Promise<Developer> {
    const developer = await this.developerRepository.findOne({
      where: {
        id,
      },
      relations: [
        'user',
        'developerPoc'
      ],
    });

    return developer;
  }

  verifyDocumentsApproved(documents: (DeveloperDocument | DeveloperDirectorDocument)[]): boolean {
    const unapproved = documents?.filter(doc => doc.status !== DocumentStatus.APPROVED)

    return unapproved?.length === 0
  }

  async updateOnboardingStage(id: number, updateDto: UpdateDeveloperOnboardingStageDto, request: Request) {
    const developer = await this.findOne(id);

    if (!developer) {
      throw new NotFoundException(`Developer with ID ${id} not found`);
    }

    const onboardingStages = developer.onboardingStages;

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

    this.developerRepository.merge(developer, {
      onboardingStages: updatedOnboardingStages,
    });

    const updated = await this.developerRepository.save(developer);

    return updated
  }

  async updateOne(
    id: number,
    updateDeveloperDto: UpdateDeveloperDto,
    request: Request
  ): Promise<Developer> {
    const developer = await this.developerRepository.findOne({
      where: { id },
      relations: [
        'proposedDevelopments',
        'developerPoc',
        'developerDocuments',
        'developerDirectors',
        'groupEntities',
      ]
    });

    if (!developer) {
      throw new NotFoundException(`Developer with ID ${id} not found`);
    }

    this.developerRepository.merge(developer, updateDeveloperDto);

    if (!updateDeveloperDto.isSubsidiary) {
      await this.updateOnboardingStage(developer.id, {
        stageName: DeveloperOnboardingStageName.GROUP_ENTITIES,
        completed: true
      }, request)
    }

    return this.developerRepository.save(developer);
  }


  async getStats(developerId: number): Promise<Record<string, number>> {
    const developer = await this.developerRepository.findOne({
      where: { id: developerId }
    })

    if (!developer) {
      throw new NotFoundException(`${Developer.name} with ID ${developerId} not found`);
    }

    // Use Promise.all to run queries concurrently instead of sequentially
    const [allProjects, stats] = await Promise.all([
      this.proposedDevelopmentRepository.count(),
      this.proposedDevelopmentRepository
        .createQueryBuilder('project')
        .select([
          'COUNT(*) as totalProjects',
          'SUM(CASE WHEN status = "PENDING" THEN 1 ELSE 0 END) as pendingProjects',
          'SUM(CASE WHEN status = "DECLINED" THEN 1 ELSE 0 END) as declinedProjects',
          'SUM(CASE WHEN status = "APPROVED" THEN 1 ELSE 0 END) as approvedProjects',
          'COALESCE(SUM(project.gdv), 0) as totalGdv'
        ])
        .where('developer_id = :developerId', { developerId })
        .getRawOne()
    ]);

    return {
      allProjects,
      pendingProjects: parseInt(stats.pendingProjects) || 0,
      declinedProjects: parseInt(stats.declinedProjects) || 0,
      approvedProjects: parseInt(stats.approvedProjects) || 0,
      totalGdv: parseFloat(stats.totalGdv) || 0
    }
  }

  async deleteAllChildrenGroupEntities(developerId: number): Promise<void> {
    await this.developerRepository
      .createQueryBuilder()
      .delete()
      .from(GroupEntity)
      .where('developer_id = :developerId', { developerId })
      .execute();
  }

  async remove(id: number): Promise<void> {
    await this.developerRepository.delete(id);
  }

  async getMailList(developerId: number): Promise<{ name: string, email: string }[]>;
  async getMailList(developer: Developer): Promise<{ name: string, email: string }[]>;
  async getMailList(developerOrId: number | Developer): Promise<{ name: string, email: string }[]> {
    let developer: Developer;

    if (typeof developerOrId === 'number') {
      developer = await this.findOne(developerOrId);
      if (!developer) {
        throw new BadRequestException('Developer not found');
      }
    } else {
      developer = developerOrId;
    }

    return [{
      name: developer.user.firstName,
      email: developer.user.email,
    }]
  }

  async updateStatus(
    id: number,
    updateDto: UpdateDeveloperStatusDto,
    request: Request
  ): Promise<Developer> {
    const developer =
      await this.developerRepository.findOne({
        where: {
          id,
        },
        relations: ['developerDirectors', 'developerDocuments', 'user', 'developerPoc'] //
      });

    if (!developer) {
      throw new NotFoundException(
        `${ProposedDevelopment.name} with ID ${id} not found`,
      );
    }

    if (updateDto.status === ApprovalStatus.DECLINED) {
      return await this.decline(id, updateDto, developer, request)
    }

    updateDto.comment = null

    const directorDocuments: DeveloperDirectorDocument[] = developer.developerDirectors
      ?.map(value => value.developerDirectorDocuments)
      ?.reduce((acc, curr) => [...acc, ...curr], [])


    const developerDocumentsAreVerified = this.verifyDocumentsApproved(developer.developerDocuments)
    const directorDocumentsAreVerified = this.verifyDocumentsApproved(directorDocuments)

    if (updateDto.status === ApprovalStatus.APPROVED) {
      if (directorDocuments.length < 1) {
        throw new UnprocessableEntityException('Cannot be approved without director documents')
      }

      if (developer.developerDocuments.length < 1) {
        throw new UnprocessableEntityException('Cannot be approved without approval documents')
      }

      if (!developerDocumentsAreVerified || !directorDocumentsAreVerified) {
        throw new BadRequestException(ErrorMessage.DOCUMENTS_NOT_APPROVED)
      }

      const onboardingStages = developer.onboardingStages

      if (!onboardingStages?.[onboardingStages?.length - 1]?.completed) {
        throw new BadRequestException('This developer has not completed their onboarding.')
      }
    }

    const { reviewerId } = updateDto;

    this.developerRepository.merge(developer, {
      ...updateDto,
      reviewer: { id: reviewerId },
      reviewedAt: new Date().toISOString(),
    });
    const response = await this.developerRepository.save(developer);

    if (updateDto.status == ApprovalStatus.APPROVED) {

      try {
        const mailDtos = await this.getMailList(developer)
        const promises: Promise<INotificationResponse>[] = []

        for (let index = 0; index < mailDtos.length; index++) {
          const contact = mailDtos[index]

          if (!contact.email || !contact.name) {
            continue
          }

          const emailDto: DeveloperApprovedBusinessRegistrationDto = {
            firstName: contact.name,
            app: this.app,
            to_email: contact.email,
            loginLink: EnvironmentHelper.env.developer_dashboard_url
          };
          promises.push(this.notificationService.sendApprovedBusinessRegistration(emailDto, request))
        }

        const responses = await Promise.all(promises)
        this.logger.log('Email Responses:', responses)
      } catch (error) {
        this.logger.error(error)
        throw error
      }
    }

    return response
  }

  async decline(
    id: number,
    updateDto: UpdateDeveloperStatusDto,
    developer: Developer,
    request: Request
  ): Promise<Developer> {
    if (!updateDto.comment || updateDto.comment.length < 1) {
      throw new BadRequestException(ErrorMessage.NO_COMMENT_DECLINE)
    }

    const { reviewerId } = updateDto;

    this.developerRepository.merge(developer, {
      ...updateDto,
      reviewer: { id: reviewerId },
      reviewedAt: new Date().toISOString(),
      status: ApprovalStatus.DECLINED,
    });

    const response = await this.developerRepository.save(developer);

    try {
      const mailList = await this.getMailList(developer)
      const promises: any = []

      for (let index = 0; index < mailList.length; index++) {
        const contact = mailList[index]

        if (!contact.email || !contact.name) {
          continue
        }

        const emailDto: DeveloperDeclinedBusinessRegistrationDto = {
          firstName: contact.name,
          app: this.app,
          to_email: contact.email,
          reason: updateDto.comment,
        };
        promises.push(this.notificationService.sendDeclinedBusinessRegistration(emailDto, request))
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
}
