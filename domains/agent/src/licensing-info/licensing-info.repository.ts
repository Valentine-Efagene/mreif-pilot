import { Repository } from 'typeorm';
import { LicensingInfo } from './licensing-info.entity';

export class UserRepository extends Repository<LicensingInfo> {
  // ...
}
