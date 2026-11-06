import { Repository } from 'typeorm';
import { Mortgage } from './mortgage.entity';

export class MortgageRepository extends Repository<Mortgage> {
  // ...
}
