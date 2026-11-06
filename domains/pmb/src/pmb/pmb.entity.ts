import { User } from '../user/user.entity';
import {
  Column,
  Entity,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { AbstractBaseEntity } from '../common/common.pure.entity';
import { LicenseType } from './pmb.enums';
import { MortgageApplicant } from '../mortgage-applicant/mortgage-applicant.entity';

@Entity({ name: 'pmbs' })
export class Pmb extends AbstractBaseEntity {
  @Column({ type: 'text', nullable: true })
  logo: string;

  @OneToOne(() => User, {
    //eager: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  admin: User;

  @OneToMany(() => User, user => user.pmbEmployer)
  staff: User[]

  @OneToMany(() => User, user => user.pmbReferrer)
  customers: User[]

  @OneToMany(() => MortgageApplicant, applicant => applicant.pmb)
  mortgageApplicants: MortgageApplicant[]

  @Column({ nullable: true })
  userId?: number;

  @Column({ nullable: true, unique: true })
  name: string;

  @Column({ nullable: true, unique: true })
  rcNumber: string;

  @Column({ nullable: true })
  code: string;

  // @Column({ 
  //   nullable: false, 
  //   default: false
  // })
  // listed: boolean;

  @Column({
    nullable: false,
    default: false
  })
  isListed: boolean;

  @Column({
    type: 'enum',
    enum: LicenseType,
    nullable: true,
  })
  licenseType: LicenseType;

  @Column({ nullable: true })
  mobile: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true, unique: true })
  email: string;

  @Column({ nullable: true, unique: true })
  website: string;

  @Column({ nullable: true, unique: true })
  domain: string;

  @Column({ nullable: true })
  postalAddress: string;

  @Column({ nullable: true })
  headOfficeAddress: string;

  // @ManyToMany(() => User)
  // @JoinTable()
  // staff: User[]
}
