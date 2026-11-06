import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserRole } from './user.enums';
import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Referral } from '../referral/referral.entity';

@ObjectType({ description: 'user' })
@Entity({ name: 'users' })
export class User {
  @Field((type) => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @Field()
  @Column({ nullable: true })
  firstName: string;

  @Field()
  @Column({ nullable: true })
  lastName: string;

  @Field()
  @Column({ nullable: true })
  phone: string;

  @Field()
  @Column({ nullable: true })
  email: string;

  @Field()
  @Column({ nullable: true })
  password: string;

  @Field()
  @Column({ default: false })
  emailVerified: boolean;

  @Field()
  @Column({ nullable: true })
  bvn: string;

  @Field()
  @Column({ type: 'text', nullable: true })
  avatar: string;

  @Field()
  @Column({ nullable: true })
  gender: string;

  @Field()
  @Column({ type: 'timestamp', nullable: true })
  dob: string;

  @Field()
  @Column({ nullable: true })
  country: string;

  @Field()
  @Column({ default: false })
  isFirstTimeLogin: boolean;

  @Field()
  @Column({ default: false })
  bvnVerified: boolean;

  @Field()
  @Column({ type: 'text', nullable: true })
  identityDocument: string;

  @Field()
  @Column({ default: false })
  identityDocument_verified: boolean;

  @Field()
  @Column({ nullable: true })
  employmentStatus: string;

  @Field()
  @Column({ type: 'double precision', scale: 2, precision: 20, nullable: true })
  monthlyNetSalary: string;

  @Field()
  @Column({ default: false })
  isNhfActive: boolean;

  @Field()
  @Column({ nullable: true })
  pfa: string;

  @Field()
  @Column({ nullable: true })
  rsa: string;

  @Field((type) => [String])
  @Column({ type: 'simple-array' })
  roles: UserRole[];

  @Field()
  @Column({ nullable: true })
  businessSector: string;

  @Field()
  @Column({ type: 'integer', nullable: true })
  yearsOfWork: number;

  @Field()
  @Column({ default: false })
  suspended: boolean;

  @Field(() => Referral)
  @OneToMany(
    () => Referral,
    referral => referral.referree
  )
  referral: Referral;
}
