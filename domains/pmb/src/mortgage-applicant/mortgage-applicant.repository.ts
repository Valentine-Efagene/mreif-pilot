import { Repository } from 'typeorm';
import { MortgageApplicant } from './mortgage-applicant.entity';

export class MortgageRepository extends Repository<MortgageApplicant> {
  // ...
}
