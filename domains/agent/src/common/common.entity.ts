import { User } from '../user/user.entity';
import { ManyToOne, JoinColumn, Column } from 'typeorm';
import { DocumentStatus, MediaType } from './common.type';
import { AbstractBaseEntity } from './common.pure.entity';
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export abstract class AbstractBaseReviewableEntity extends AbstractBaseEntity {
  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'reviewed_by' })
  reviewer: User;

  @Column({ type: 'datetime', precision: 6, nullable: true })
  reviewedAt: Date;
}

@ObjectType()
export abstract class AbstractBaseDocumentEntity extends AbstractBaseReviewableEntity {
  @Column({
    type: 'enum',
    enum: DocumentStatus,
    default: DocumentStatus.PENDING,
  })
  @Field()
  status: DocumentStatus;

  @Field()
  @Column({ nullable: true })
  declineReason: string;

  @Field()
  @Column({ type: 'text', nullable: false })
  url: string;

  @Field()
  @Column({ nullable: true })
  description: string;

  @Field()
  @Column({ nullable: true })
  name: string;

  @Field()
  @Column({ nullable: true, comment: 'In bytes' })
  size?: number;
}

export abstract class AbstractBaseMediaEntity extends AbstractBaseDocumentEntity {
  @Column({
    type: 'enum',
    enum: MediaType,
    default: MediaType.IMAGE,
  })
  mediaType: MediaType;
}
