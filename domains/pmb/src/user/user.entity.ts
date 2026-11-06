import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { UserRole } from './user.enums';
import { Pmb } from '../pmb/pmb.entity';
import { Mortgage } from '../mortgage/mortgage.entity';
import { AbstractBaseEntity } from '../common/common.pure.entity';

@Entity({ name: 'users' })
export class User extends AbstractBaseEntity {
  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ nullable: true })
  email: string;

  @Column({ type: 'text', nullable: true })
  avatar: string;

  @Column({ nullable: true })
  country: string;

  @Column({ default: false })
  isFirstTimeLogin: boolean;

  @Column({ type: 'double precision', scale: 2, precision: 20, nullable: true })
  monthlyNetSalary: string;

  @Column({ type: 'json' })
  roles: UserRole[];

  @Column({ nullable: true })
  phone: string;

  @Column({ default: false })
  emailVerified: boolean;

  @Column({ default: false })
  bvnVerified: boolean;

  @Column({ nullable: true })
  bvn: string;

  @Column({ nullable: true })
  gender: string;

  @Column({ type: 'timestamp', nullable: true })
  dob: string;

  @Column({ type: 'text', nullable: true })
  identityDocument: string;

  @Column({ default: false })
  identityDocument_verified: boolean;

  @Column({ nullable: true })
  pfa: string;

  @Column({ nullable: true })
  rsa: string;

  @ManyToOne(() => Pmb, {
    //eager: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'pmb_employer_id' })
  pmbEmployer?: Pmb;

  @Column({ nullable: true })
  pmbEmployerId?: number;

  @ManyToOne(() => Pmb, {
    //eager: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'pmb_parent_id' })
  pmbReferrer?: Pmb;

  @Column({ nullable: true })
  pmbParentId?: number;

  @Column({ default: false })
  suspended: boolean;

  @OneToMany(() => Mortgage, mortgage => mortgage.user)
  mortgages: Mortgage[]
}