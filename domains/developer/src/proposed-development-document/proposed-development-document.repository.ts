import { Repository } from 'typeorm';
import { ProposedDevelopmentDocument } from './proposed-development-document.entity';

export class DeveloperDocumentRepository extends Repository<ProposedDevelopmentDocument> {
  // ...
}
