import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { LicensingInfo } from './licensing-info.entity';
import { LicensingInfoService } from './licensing-info.service';

@Resolver((of) => LicensingInfo)
export default class LicensingInfoResolver {
  constructor(private licensingInfoService: LicensingInfoService) {}

  @Query((returns) => LicensingInfo)
  async getLicensingInfo(@Args('id', { type: () => Int }) id: number) {
    return this.licensingInfoService.findOne(id);
  }

  // @Mutation(returns => LicensingInfo)
  // async createLicensingInfo(@Args() dto: CreateLicensingInfoDto) {
  //     return this.licensingInfoService.create(dto)
  // }

  // @Mutation(returns => LicensingInfo)
  // async updateLicensingInfo(@Args() dto: UpdateLicensingInfoDto) {
  //     return this.licensingInfoService.updateOne(dto)
  // }
}
