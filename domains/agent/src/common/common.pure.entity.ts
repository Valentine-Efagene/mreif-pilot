import { Field, GraphQLISODateTime, Int, ObjectType } from '@nestjs/graphql';
import {
  CreateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@ObjectType()
export abstract class AbstractBaseEntity {
  @Field((type) => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field((type) => GraphQLISODateTime)
  @CreateDateColumn({ type: 'datetime', precision: 6, default: () => 'CURRENT_TIMESTAMP(6)' })
  createdAt: Date;

  @Field((type) => GraphQLISODateTime)
  @UpdateDateColumn({
    type: 'datetime',
    precision: 6,
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  updatedAt: Date;

  @Field((type) => GraphQLISODateTime)
  @DeleteDateColumn({ type: 'datetime', precision: 6, nullable: true })
  deletedAt: Date;
}
