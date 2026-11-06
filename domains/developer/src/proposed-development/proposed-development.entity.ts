import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import {
  Category,
  PresellCommitmentEvidence,
  ProjectType,
  ProposedDevelopmentApprovalStatus,
} from './proposed-development.enums';
import { Developer } from '../developer/developer.entity';
import { ProposedProperty } from '../proposed-property/proposed-property.entity';
import { User } from '../user/user.entity';
import { AbstractBaseReviewableEntity } from '../common/common.entity';
import { ProposedDevelopmentDocument } from '../proposed-development-document/proposed-development-document.entity';
import { OnboardingStage } from './proposed-development.type';

@Entity({ name: 'proposed_developments' })
export class ProposedDevelopment extends AbstractBaseReviewableEntity {
  get name(): string {
    // const developerName = this.developer?.businessName || "Unknown Developer";
    const location = `${this.city || "Unknown City"}, ${this.state || "Unknown State"}`;
    return location;
  }

  @Column({
    type: 'enum',
    enum: ProjectType,
    nullable: true,
  })
  type: ProjectType;

  @Column({
    type: 'enum',
    enum: Category,
    nullable: true,
  })
  category: Category;

  @Column({ nullable: true })
  proposedLocation: string;

  @Column({ nullable: true })
  state: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  locationIsMarketable: boolean;

  @Column({ default: false })
  isCompleted: boolean;

  // Should remove
  @Column({ nullable: true })
  hasAuditedAccounts: boolean;
  // End should remove

  @OneToMany(
    () => ProposedProperty,
    (proposedProperty) => proposedProperty.proposedDevelopment,
    { eager: true },
  )
  proposedProperties: ProposedProperty[];

  @Column({
    type: 'enum',
    enum: ProposedDevelopmentApprovalStatus,
    default: ProposedDevelopmentApprovalStatus.PENDING,
  })
  status: ProposedDevelopmentApprovalStatus;

  @Column({
    type: 'double precision',
    scale: 2,
    precision: 20,
    nullable: true,
    comment: 'Gross Development Value',
  })
  gdv: number;

  @ManyToOne(() => Developer, (developer) => developer.proposedDevelopments)
  @JoinColumn({ name: 'developer_id' })
  developer: Developer;

  @Column({ nullable: true })
  developerId: number;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'reviewed_by' })
  reviewer: User;

  @Column({ type: 'timestamp', nullable: true })
  reviewedAt: string;

  @Column({
    nullable: true,
    comment:
      'Does the Land have a statutory Certificate of Occupancy (C of O)?',
  })
  landHasCoc: boolean;

  @Column({
    nullable: true,
    comment: 'Reason for declining',
  })
  declineReason: string;

  @Column({ type: 'json', nullable: true })
  affectedDocuments: string[];

  @Column({ nullable: true })
  developerHasAnotherTitleAtLocation: boolean;

  @Column({
    type: 'double precision',
    scale: 2,
    precision: 20,
    nullable: true,
    comment: 'Total Cost',
  })
  totalDevelopmentCost: number;

  @Column({ nullable: true })
  developerCanProvideEquity: boolean;

  @Column({ nullable: true })
  equityIsAvailableNow: boolean;

  @Column({ type: 'text', nullable: true })
  targetOfftakers: string;

  @Column({ nullable: true })
  targetOfftakersProfiled: boolean;

  @Column({ nullable: true, type: 'text' })
  targetOfftakersProfileInfo: string;

  @Column({ nullable: true })
  nUnitsPresoldOrCommited: number;

  @Column({
    type: 'enum',
    enum: PresellCommitmentEvidence,
    nullable: true,
  })
  presellCommitmentEvidence: PresellCommitmentEvidence;

  @Column({ nullable: true })
  designAndCostAvailable: boolean;

  @Column({ nullable: true })
  drawingsAreByRegisteredConsultants: boolean;

  @Column({ nullable: true })
  nameOnCOfO: string;

  @Column({ nullable: true, type: 'text' })
  registryInfo: string;

  @Column({
    type: 'json',
    nullable: true
  })
  onBoardingStages: OnboardingStage[] | null;

  @OneToMany(
    () => ProposedDevelopmentDocument,
    (proposedDevelopmentDocument) =>
      proposedDevelopmentDocument.proposedDevelopment,
    { eager: true },
  )
  proposedDevelopmentDocuments: ProposedDevelopmentDocument[];
}//
