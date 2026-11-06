import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Referral } from './referral.entity';
import { ReferralService } from './referral.service';
import {
  CreateReferralDto,
  PaginatedReferrals,
  UpdateReferralDto,
} from './referral.dto';
import { PaginationArgs } from '../common/common.dto';

@Resolver((of) => Referral)
export default class ReferralResolver {
  constructor(private referralService: ReferralService) {}

  @Query((returns) => Referral)
  async getReferral(@Args('id', { type: () => Int }) id: number) {
    return this.referralService.findOne(id);
  }

  @Mutation((returns) => Referral)
  async createReferral(@Args() dto: CreateReferralDto): Promise<Referral> {
    return this.referralService.create(dto);
  }

  @Mutation((returns) => Referral)
  async updateReferral(@Args() dto: UpdateReferralDto) {
    return this.referralService.updateOne(dto);
  }

  @Query(() => PaginatedReferrals)
  async referrals(
    @Args() paginationArgs: PaginationArgs,
  ): Promise<PaginatedReferrals> {
    const result = await this.referralService.paginate(paginationArgs);
    return result;
  }
}
