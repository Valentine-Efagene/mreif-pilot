import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto, UpdateUserDto } from './user.dto';
import { IPaginatedUsers } from './user.type';
import { MortgageStatus } from '../mortgage/mortgage.enums';
import { SinglePmbStatsDto } from '../pmb/pmb.dto';
import { paginate, Paginated, PaginateQuery } from 'nestjs-paginate';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User, 'pmb')
    private readonly userRepository: Repository<User>,
  ) { }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const entity = this.userRepository.create(createUserDto);
    return await this.userRepository.save(entity);
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async customersMortgageStatsByPmb(pmbId: number): Promise<SinglePmbStatsDto> {
    const query: SelectQueryBuilder<User> = this.userRepository.createQueryBuilder('user')
      .leftJoin('user.mortgages', 'mortgage')
      .leftJoin('mortgage.applicants', 'mortgageApplicant')
      .where('user.suspended = :isSuspended', { isSuspended: false })
      .andWhere('mortgageApplicant.preferredMortgageBank = :pmbId', { pmbId })
      .andWhere('mortgageApplicant.isPrincipalApplicant = :isPrincipal', { isPrincipal: true })

    const activePromise = query.clone()
      .andWhere('mortgage.status = :status', { status: MortgageStatus.DISBURSEMENT })
      .distinct(true)
      .getCount()

    const activeCustomersPromise = this.userRepository.count({
      where: {
        pmbParentId: pmbId,
        suspended: false
      }
    })

    const allCustomersPromise = this.userRepository.count({
      where: {
        pmbParentId: pmbId,
      }
    })

    const pendingPromise = query.clone()
      .andWhere('mortgage.status NOT IN (:mortgageStatus)', {
        mortgageStatus: [
          MortgageStatus.DISBURSEMENT,
          MortgageStatus.CANCELLED,
          MortgageStatus.CLOSED,
          MortgageStatus.PROVISIONAL_OFFER_ACCEPTED,
        ],
      })
      .distinct(true)
      .getCount()

    const cancelledPromise = query.clone()
      .andWhere('mortgage.status = :mortgageStatus', {
        mortgageStatus: MortgageStatus.CANCELLED
      })
      .distinct(true)
      .getCount()

    const closedPromise = query.clone()
      .andWhere('mortgage.status = :mortgageStatus', {
        mortgageStatus: MortgageStatus.CLOSED
      })
      .distinct(true)
      .getCount()

    const [active, pending, cancelled, closed, activeCustomers, allCustomers] = await Promise.all([
      activePromise,
      pendingPromise,
      cancelledPromise,
      closedPromise,
      activeCustomersPromise,
      allCustomersPromise
    ])

    return {
      customersOnActiveLoans: active,
      customersOnPendingLoans: pending,
      customersOnClosedLoans: closed,
      customersOnCancelledLoans: cancelled,
      activeCustomers,
      allCustomers
    }
  }

  findOne(id: number): Promise<User> {
    return this.userRepository.findOneBy({ id });
  }

  async updateOne(id: number, updateDto: UpdateUserDto): Promise<User> {
    const employer = await this.userRepository.findOneBy({ id });

    if (!employer) {
      throw new NotFoundException(`${User.name} with ID ${id} not found`);
    }

    this.userRepository.merge(employer, updateDto);
    return this.userRepository.save(employer);
  }

  findAllCustomersByPmbPaginated(pmbId: number, query: PaginateQuery): Promise<Paginated<User>> {
    return paginate(query, this.userRepository, {
      sortableColumns: ['id', 'createdAt', 'updatedAt'],
      //nullSort: 'last',
      defaultSortBy: [['id', 'DESC']],
      searchableColumns: ['email'],
      //select: ['id'],
      filterableColumns: {
        pmbId: true,
        //name: [FilterOperator.EQ, FilterSuffix.NOT],
        //age: true,
      },
      where: {
        pmbParentId: pmbId,
        suspended: false // User is not suspended
      },
    });
  }

  async paginate(page: number = 1, limit: number = 10): Promise<IPaginatedUsers> {
    const [users, total] = await this.userRepository.findAndCount({
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
    await this.userRepository.delete(id);
  }
}
