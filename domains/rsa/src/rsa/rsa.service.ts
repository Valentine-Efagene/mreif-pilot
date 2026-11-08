import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { PaginatedRsa } from './rsa.type';
import { Rsa } from './rsa.entity';
import { CreateRsaDto, UpdateRsaDto, UpdateRsaStatusDto } from './rsa.dto';
import {
  //FilterOperator,
  //FilterSuffix,
  PaginateQuery,
  paginate,
  Paginated,
} from 'nestjs-paginate';
import { RsaDocument } from '../rsa-document/rsa-document.entity';
import { RsaStatus } from './rsa.enums';
import { DocumentStatus } from '../common/common.type';
import ExceptionHelper from '../common/helpers/ExceptionHelper';
import { ErrorMessage, MySqlErrorCodes } from '../common/common.enum';
import { RsaApplicationAcknowledgementDto, RsaApplicationApprovedDto, RsaApplicationDeclinedDto } from '../notification/notification.dto';
import { NotificationService } from '../notification/notification.service';
import { App } from '../notification/notification.enums';
import { MortgageService } from '../mortgage/mortgage.service';
import TypeHelper from '../common/helpers/TypeHelper';

// https://www.npmjs.com/package/nestjs-paginate
@Injectable()
export class RsaService {
  private app: App

  constructor(
    @InjectRepository(Rsa, 'rsa')
    private readonly rsaRepository: Repository<Rsa>,

    @InjectRepository(RsaDocument, 'rsa')
    private rsaDocumentRepository: Repository<RsaDocument>,

    private notificationService: NotificationService,
    private mortgageService: MortgageService,
    @InjectDataSource('rsa')
    private dataSource: DataSource,
  ) {
    this.app = TypeHelper.toEnum(App, process.env.APP)
  }

  async create(dto: CreateRsaDto, request: Request): Promise<Rsa> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    let persistedRsa: Rsa;

    try {
      const rsa = new Rsa();
      rsa.mortgageId = dto.mortgageId;
      rsa.rsa = dto.rsa;
      rsa.pfa = dto.pfa;

      try {
        persistedRsa = await queryRunner.manager.save(rsa);
      } catch (error) {
        if (ExceptionHelper.isMySqlError(error)) {
          switch (error.code) {
            case MySqlErrorCodes.ER_DUP_ENTRY:
              throw new BadRequestException(ErrorMessage.DUPLICATE_RSA)

            case MySqlErrorCodes.ER_NO_REFERENCED_ROW_2:
              throw new BadRequestException(ErrorMessage.MISSING_PARENT_MORTGAGE)

            case MySqlErrorCodes.ER_NO_REFERENCED_ROW:
              throw new BadRequestException(ErrorMessage.MISSING_PARENT_MORTGAGE)

            default:
              break;
          }
        }
      }

      for (let i = 0; i < dto.rsaDocuments.length; i++) {
        const data = dto.rsaDocuments[i]
        const document = new RsaDocument();
        document.name = data.name;
        document.url = data.url;
        document.rsaId = persistedRsa.id;
        document.size = dto.rsaDocuments[i]?.size
        await queryRunner.manager.save(document);
      }

      await queryRunner.commitTransaction();

      this.sendAcknowledgementEmail(dto.mortgageId, request)

      return persistedRsa;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  verifyDocumentsApproved(rsa: Rsa): boolean {
    const unapproved = rsa?.rsaDocuments?.filter(doc => doc.status !== DocumentStatus.APPROVED)

    return unapproved?.length === 0
  }

  async sendApprovalEmail(emailDto: RsaApplicationApprovedDto, request: Request) {
    try {
      this.notificationService.sendRsaApplicationApproved(emailDto, request)
    } catch (error) {
      console.log('Error while sending approval email:', error)
    }
  }

  async sendDeclineEmail(emailDto: RsaApplicationDeclinedDto, request: Request) {
    try {
      this.notificationService.sendRsaApplicationDeclined(emailDto, request)
    } catch (error) {
      console.log('Error while sending decline email:', error)
    }
  }

  async sendAcknowledgementEmail(mortgageId: number, request: Request) {
    try {
      const mortgage = await this.mortgageService.findOneWithUser(mortgageId)
      const user = mortgage.user

      if (!user?.email) {
        return new InternalServerErrorException('The user does not have an email')
      }

      const emailDto: RsaApplicationAcknowledgementDto = {
        firstname: user.firstName ?? user.lastName,
        app: this.app,
        to_email: user.email
      }

      this.notificationService.sendRsaApplicationAcknowledgement(emailDto, request)
    } catch (error) {
      console.log('Error while sending decline email:', error)
    }
  }

  async updateStatus(
    id: number,
    updateDto: UpdateRsaStatusDto,
    request: Request
  ): Promise<Rsa> {
    const rsa =
      await this.rsaRepository.findOne({
        where: { id },
        relations: ['rsaDocuments', 'mortgage', 'mortgage.user']
      });

    if (!rsa) {
      throw new NotFoundException(
        `${Rsa.name} with ID ${id} not found`,
      );
    }

    if (updateDto.status === RsaStatus.APPROVED && !this.verifyDocumentsApproved(rsa)) {
      throw new BadRequestException(ErrorMessage.DOCUMENTS_NOT_APPROVED)
    }

    const { reviewerId, ...rest } = updateDto;

    this.rsaRepository.merge(rsa, {
      ...rest,
      reviewer: { id: reviewerId },
      reviewedAt: new Date().toISOString()
    });

    const response = await this.rsaRepository.save(rsa);

    const user = rsa?.mortgage?.user

    if (updateDto.status === RsaStatus.APPROVED) {
      this.sendApprovalEmail({
        app: this.app,
        firstname: user.firstName ?? user.lastName,
        to_email: user.email
      },
        request)
    }

    if (updateDto.status === RsaStatus.DECLINED) {
      this.sendDeclineEmail({
        app: this.app,
        firstname: user.firstName ?? user.lastName,
        to_email: user.email
      },
        request)
    }

    return response
  }

  async findAll(): Promise<Rsa[]> {
    return this.rsaRepository.find();
  }

  async findDocuments(rsaId: number): Promise<RsaDocument[]> {
    return this.rsaDocumentRepository.find({
      where: { rsa: { id: rsaId } },
    });
  }

  async getCount(): Promise<number> {
    return this.rsaRepository.count();
  }

  async findAllNamesOnly(): Promise<Rsa[]> {
    return this.rsaRepository.find({ select: ['id'] });
  }

  findAllPaginated(query: PaginateQuery): Promise<Paginated<Rsa>> {
    return paginate(query, this.rsaRepository, {
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

  async findOne(id: number): Promise<Rsa> {
    const rsa = this.rsaRepository.findOne({
      where: { id },
      relations: ['rsaDocuments']
    });

    if (!rsa) {
      throw new NotFoundException(`${Rsa.name} with ID ${id} not found`);
    }

    return rsa;
  }

  async findOneByMortgageId(id: number): Promise<Rsa> {
    const rsa = this.rsaRepository.findOne({
      where: { mortgageId: id },
      relations: ['rsaDocuments']
    });

    if (!rsa) {
      throw new NotFoundException(`${Rsa.name} with Mortgage ID ${id} not found`);
    }

    return rsa;
  }

  async updateOne(
    id: number,
    updateRsaDto: UpdateRsaDto,
  ): Promise<Rsa> {
    const rsa = await this.rsaRepository.findOneBy({ id });

    if (!rsa) {
      throw new NotFoundException(`Rsa with ID ${id} not found`);
    }

    this.rsaRepository.merge(rsa, {
      ...updateRsaDto,
      status: RsaStatus.PENDING
    });
    return this.rsaRepository.save(rsa);
  }

  async paginate(page: number = 1, limit: number = 10): Promise<PaginatedRsa> {
    const [users, total] = await this.rsaRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      total,
      totalPages,
      currentPage: page,
      data: users,
    };
  }

  async remove(id: number): Promise<void> {
    await this.rsaRepository.delete(id);
  }
}
