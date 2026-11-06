import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { LicensingDocument } from './licensing-document.entity';
import { LicensingDocumentService } from './licensing-document.service';
import {
  CreateLicensingDocumentDto,
  UpdateLicensingDocumentDto,
} from './licensing-document.dto';

@Resolver((of) => LicensingDocument)
export default class LicensingDocumentResolver {
  constructor(private agentDocumentService: LicensingDocumentService) {}

  @Query((returns) => LicensingDocument)
  async getLicensingDocument(@Args('id', { type: () => Int }) id: number) {
    return this.agentDocumentService.findOne(id);
  }

  @Query((returns) => LicensingDocument)
  async getLicensingDocuments() {
    return this.agentDocumentService.findAll();
  }

  @Mutation((returns) => LicensingDocument)
  async createLicensingDocument(@Args() dto: CreateLicensingDocumentDto) {
    return this.agentDocumentService.create(dto);
  }

  // @Mutation(returns => LicensingDocument)
  // async updateLicensingDocument(@Args() dto: UpdateLicensingDocumentDto) {
  //     return this.agentDocumentService.updateOne(dto)
  // }
}
