import { User } from '../user/user.entity';
import {
  ManyToOne,
  JoinColumn,
  Column,
} from 'typeorm';
import { DocumentStatus } from './common.type';
import { AbstractBaseEntity } from './common.pure.entity';

export abstract class AbstractBaseReviewableEntity extends AbstractBaseEntity {
  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'reviewed_by' })
  reviewer: User;

  @Column({ nullable: true })
  reviewedBy: number;

  @Column({ type: 'datetime', precision: 6, nullable: true })
  reviewedAt: string;
}

export abstract class AbstractBaseDocumentEntity extends AbstractBaseReviewableEntity {
  @Column({
    type: 'enum',
    enum: DocumentStatus,
    default: DocumentStatus.PENDING,
  })
  status: DocumentStatus;

  @Column({ nullable: true })
  declineReason: string;

  @Column({ type: 'text', nullable: false })
  url: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true, comment: "In bytes" })
  size: number
}

export abstract class WithOwner {
  abstract getOwnerId(id: number | null): Promise<number>
}