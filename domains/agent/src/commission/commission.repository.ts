import { Repository } from 'typeorm';
import { Commission } from './commission.entity';

export class CommissionRepository extends Repository<Commission> {
  // ...
}
