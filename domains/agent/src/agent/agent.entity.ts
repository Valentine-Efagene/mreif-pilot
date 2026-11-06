import { Column, Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { AgentType } from './agent.enums';
import { User } from '../user/user.entity';
import { Field, ObjectType } from '@nestjs/graphql';
import { LicensingInfo } from '../licensing-info/licensing-info.entity';
import { Referral } from '../referral/referral.entity';
import { CreateAgentDto } from './agent.dto';
import { IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { AbstractBaseReviewableEntity } from '../common/common.entity';
import { Status } from '../common/common.type';
import { AgentPoc } from '../agent-poc/agent-poc.entity';

@ObjectType({ description: 'agent' })
@Entity({ name: 'agents' })
export class Agent extends AbstractBaseReviewableEntity {
  constructor(agentData?: CreateAgentDto) {
    super();
    if (agentData) {
      Object.assign(this, agentData);
    }
  }

  @Field(() => User)
  @OneToOne(() => User, {
    // eager: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Field(() => String)
  @Column({ nullable: true })
  userId: number;

  @OneToOne(() => AgentPoc, (poc) => poc.agent)
  poc: AgentPoc;

  @Field(() => String)
  @Column({ nullable: true })
  referralCode: string;

  @Column({
    nullable: true
  })
  @IsNumber()
  @Type(() => Number)
  commissionPercentage: number;

  @Field(() => AgentType)
  @Column({
    type: 'enum',
    enum: AgentType,
    default: AgentType.INDIVIDUAL,
  })
  agentType: AgentType;

  @Field(() => [LicensingInfo])
  @OneToMany(() => LicensingInfo, (licensingInfo) => licensingInfo.agent)
  licensingInfo: LicensingInfo[];

  @Field(() => [Referral])
  @OneToMany(() => Referral, (referral) => referral.referrer)
  referrals: Referral[];

  @Field(() => String)
  @Column()
  title: string;

  @Field(() => String)
  @Column({
    nullable: false
  })
  name: string;

  @Field(() => String)
  @Column({
    nullable: true
  })
  phone: string;

  @Field(() => String)
  @Column({
    nullable: true
  })
  phone2: string;

  @Field(() => String)
  @Column({
    nullable: true
  })
  companyName: string;

  @Field(() => String)
  @Column({
    nullable: true
  })
  rcNumber: string;

  @Field(() => String)
  @Column({
    nullable: true
  })
  companyEmail: string;

  @Field(() => String)
  @Column({
    nullable: true
  })
  companyPhone: string;

  @Field(() => String)
  @Column({
    nullable: true
  })
  bankName: string;

  @Field(() => String)
  @Column({
    nullable: true
  })
  accountName: string;

  @Field(() => String)
  @Column({
    nullable: true
  })
  accountNumber: string;

  @Field(() => String)
  @Column({
    nullable: true
  })
  countryOfResidence: string;

  @Field(() => String)
  @Column({
    nullable: true
  })
  state: string;

  @Field(() => String)
  @Column({
    nullable: true
  })
  city: string;

  @Column({
    type: 'enum',
    enum: Status,
    default: Status.PENDING,
  })
  @Field()
  status: Status;

  @Field()
  @Column({ nullable: true })
  comment: string;
}
