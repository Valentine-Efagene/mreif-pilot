import {
  ManyToOne,
  JoinColumn,
  Column,
} from 'typeorm';
import { DocumentStatus } from './common.type';
import { User } from '../user/user.entity';
import { AbstractBaseEntity } from './common.pure.entity';

export abstract class AbstractBaseReviewableEntity extends AbstractBaseEntity {
  @Column({ nullable: true })
  comment: string;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'reviewed_by' })
  reviewer: User;

  @Column({ type: 'timestamp', nullable: true })
  reviewedAt: string;
}

export abstract class AbstractBaseDocumentEntity extends AbstractBaseReviewableEntity {
  @Column({
    type: 'enum',
    enum: DocumentStatus,
    default: DocumentStatus.PENDING,
  })
  status: DocumentStatus;

  @Column({ type: 'text', nullable: false })
  url: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  name: string;

  @Column({
    nullable: true,
    comment: "In bytes"
  })
  size: number
}
