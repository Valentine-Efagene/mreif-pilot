import { User } from '../user/user.entity';
import {
  Column,
  Entity,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { ModeOfBusinessRegistration } from './developer.enums';
import { ProposedDevelopment } from '../proposed-development/proposed-development.entity';
import { DeveloperDirector } from '../developer-director/developer-director.entity';
import { DeveloperPoc } from '../developer-poc/developer-poc.entity';
import { GroupEntity } from '../group-entity/group-entity.entity';
import { DeveloperDocument } from '../developer-document/developer-document.entity';
import { DeveloperOnboardingStage } from './developer.dto';
import { AbstractBaseReviewableEntity } from '../common/common.entity';
import { ApprovalStatus } from '../common/common.enum';

@Entity({ name: 'developers' })
export class Developer extends AbstractBaseReviewableEntity {
  @Column({ type: 'text', nullable: true })
  logo: string;

  @OneToOne(() => User, {
    //eager: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ nullable: true })
  userId: number;

  @Column({ nullable: true })
  businessName: string;

  @Column({ nullable: true, type: 'text' })
  comment?: string

  @Column({ nullable: true })
  isGovernmentAgency: boolean;

  @Column({ nullable: true })
  isSubsidiary: boolean;

  @Column({ nullable: true })
  hasAuditedAccounts: boolean;

  @Column({
    type: 'enum',
    enum: ApprovalStatus,
    default: ApprovalStatus.PENDING,
  })
  status: ApprovalStatus;

  @Column({ nullable: true })
  hasTrackRecordInPropertyDevelopment: boolean;

  @Column({ nullable: true })
  jobRole: string;

  @Column({ type: 'integer', nullable: true })
  yearsOfOperation: number;

  @Column({
    type: 'enum',
    enum: ModeOfBusinessRegistration,
    nullable: true,
  })
  modeOfRegistration: ModeOfBusinessRegistration;

  @Column({ nullable: true })
  rcNumber: string;

  @Column({ nullable: true })
  registeredAddress: string;

  @Column({ nullable: true })
  operatingAddress: string;

  @Column({ nullable: false, type: 'boolean', default: false })
  agreedToTerms: boolean;

  @Column({ nullable: true })
  tin: string;

  @Column({ nullable: true })
  accountNumber: string;

  @Column({ nullable: true })
  accountName: string;

  @Column({ nullable: true })
  bank: string;

  @OneToMany(() => GroupEntity, (groupEntity) => groupEntity.developer,
    //{eager: true}
  )
  groupEntities: GroupEntity[];

  @OneToMany(
    () => DeveloperDocument,
    (developerDocument) => developerDocument.developer,
    //{eager: true},
  )
  developerDocuments: DeveloperDocument[];

  @OneToMany(
    () => ProposedDevelopment,
    (proposedDevelopment) => proposedDevelopment.developer,
    //{ eager: true },
  )
  proposedDevelopments: ProposedDevelopment[];

  @OneToMany(
    () => DeveloperDirector,
    (developerDirector) => developerDirector.developer,
    //{ eager: true },
  )
  developerDirectors: DeveloperDirector[];

  @OneToOne(() => DeveloperPoc, (developerPoc) => developerPoc.developer)
  developerPoc: DeveloperPoc;

  @Column({
    type: 'json',
    nullable: true
  })
  onboardingStages: DeveloperOnboardingStage[] | null;
}
