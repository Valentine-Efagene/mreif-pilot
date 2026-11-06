import { User } from '../../../../domains/developer/src/user/user.entity';
import { Developer } from '../../../../domains/developer/src/developer/developer.entity';
import { DeveloperDirector } from '../../../../domains/developer/src/developer-director/developer-director.entity';
import { DeveloperDirectorDocument } from '../../../../domains/developer/src/developer-director-document/developer-director-document.entity';
import { DeveloperDocument } from '../../../../domains/developer/src/developer-document/developer-document.entity';
import { DeveloperPoc } from '../../../../domains/developer/src/developer-poc/developer-poc.entity';
import { GroupEntity } from '../../../../domains/developer/src/group-entity/group-entity.entity';
import { Property } from '../../../../domains/developer/src/property/property.entity';
import { ProposedDevelopment } from '../../../../domains/developer/src/proposed-development/proposed-development.entity';
import { ProposedDevelopmentDocument } from '../../../../domains/developer/src/proposed-development-document/proposed-development-document.entity';
import { ProposedProperty } from '../../../../domains/developer/src/proposed-property/proposed-property.entity';
import { Wallet } from '../../../../domains/developer/src/wallet/wallet.entity';

export const DEVELOPER_ENTITIES = [
  User,
  Developer,
  DeveloperDirector,
  DeveloperDirectorDocument,
  DeveloperDocument,
  DeveloperPoc,
  GroupEntity,
  Property,
  ProposedDevelopment,
  ProposedDevelopmentDocument,
  ProposedProperty,
  Wallet,
];

export const DEVELOPER_CONNECTION = 'developer';
