import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Commission } from './commission.entity';
import { CommissionService } from './commission.service';
import {
  CreateCommissionDto,
  PaginatedCommissions,
  UpdateCommissionDto,
} from './commission.dto';
import { PaginationArgs } from '../common/common.dto';

@Resolver((of) => Commission)
export default class CommissionResolver {
  constructor(private commissionService: CommissionService) {}

  @Query((returns) => Commission)
  async getCommission(@Args('id', { type: () => Int }) id: number) {
    return this.commissionService.findOne(id);
  }

  @Mutation((returns) => Commission)
  async createCommission(
    @Args() dto: CreateCommissionDto,
  ): Promise<Commission> {
    return this.commissionService.create(dto);
  }

  // @Mutation(returns => Commission)
  // async updateCommission(@Args() dto: UpdateCommissionDto) {
  //     return this.commissionService.updateOne(dto)
  // }

  @Query(() => PaginatedCommissions)
  async commissions(
    @Args() paginationArgs: PaginationArgs,
  ): Promise<PaginatedCommissions> {
    const result = await this.commissionService.paginate(paginationArgs);
    return result;
  }
}
