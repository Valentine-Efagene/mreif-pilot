import { Repository } from 'typeorm';
import { Developer } from './developer.entity';

export class DeveloperRepository extends Repository<Developer> {
  // ...
}
