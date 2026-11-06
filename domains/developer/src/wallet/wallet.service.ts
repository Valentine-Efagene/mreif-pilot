import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { paginate, Paginated, PaginateQuery } from 'nestjs-paginate';
import { Wallet } from './wallet.entity';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet, 'developer')
    private readonly walletRepository: Repository<Wallet>,
  ) { }

  async findAll(): Promise<Wallet[]> {
    return this.walletRepository.find();
  }

  findAllPaginated(query: PaginateQuery): Promise<Paginated<Wallet>> {
    return paginate(query, this.walletRepository, {
      sortableColumns: ['id', 'createdAt', 'updatedAt'],
      defaultSortBy: [['id', 'DESC']],
      searchableColumns: ['accountName'],
      filterableColumns: {
      },
    });
  }

  findOne(id: number): Promise<Wallet> {
    return this.walletRepository.findOneBy({ id: id });
  }
}
