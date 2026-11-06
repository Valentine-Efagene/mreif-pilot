import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { AbstractBaseEntity } from '../common/common.pure.entity';
import { Field, Float, Int, ObjectType } from '@nestjs/graphql';
import { Referral } from '../referral/referral.entity';
import { CommissionStatus } from './commission.enums';

@ObjectType({ description: 'commission' })
@Entity({ name: 'commissions' })
export class Commission extends AbstractBaseEntity {
  @Field(() => Referral)
  @ManyToOne(() => Referral, (referral) => referral.commissions, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'referral_id' })
  referral: Referral;

  @Field(() => Int)
  @Column({ nullable: true })
  referralId: number;

  @Field(() => Float)
  @Column({
    type: 'double precision',
    scale: 2,
    precision: 20,
    nullable: true,
    comment: 'Commission received',
  })
  amount: number;

  @Column({
    type: 'enum',
    enum: CommissionStatus,
    default: CommissionStatus.PENDING,
  })
  @Field()
  status: CommissionStatus;

  @Column({
    nullable: true
  })
  @Field(() => String)
  comment: string
}
