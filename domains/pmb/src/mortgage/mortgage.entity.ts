import { User } from '../user/user.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { MortgageStatus, RequestType } from './mortgage.enums';
import { MortgageApplicant } from '../mortgage-applicant/mortgage-applicant.entity';

@Entity({ name: 'new_mortgage_applications' })
export class Mortgage {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, user => user.mortgages, {
    // eager: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  // @ManyToOne(() => User, user => user.mortgages, {
  //   // eager: true,
  //   onDelete: 'CASCADE',
  //   onUpdate: 'CASCADE',
  // })
  // @JoinColumn({ name: 'preferred_mortgage_bank' })
  // pmb: Pmb;

  // @Column()
  // preferredMortgageBank: number

  @Column()
  userId: number

  @OneToMany(() => MortgageApplicant, (applicant) => applicant.mortgage)
  applicants: MortgageApplicant[];

  @Column()
  unitId: number

  @Column({
    type: 'enum',
    enum: MortgageStatus
  })
  status: MortgageStatus

  @Column({
    type: 'enum',
    enum: RequestType
  })
  type: RequestType

  @Column()
  isJoint: boolean

  @Column()
  buildingId: number

  @Column()
  propertyId: number

  @Column()
  applicationId: number

  @Column()
  loanAmount: number

  @Column()
  rsaBalance: number

  @Column()
  loanPercent: number

  @Column()
  equityAmount: number

  @Column()
  propertyCost: number

  @Column()
  equityPercent: number

  @Column()
  monthlyPayment: number

  @Column()
  userNextAction: string | null

  @Column()
  adminNextAction: string

  @Column()
  durationInMonths: number

  @Column()
  equityWithoutRsa: number

  @Column()
  interestPerAnnum: number

  @Column()
  currentStatusReason: string | null

  @Column()
  equityFromRsaAmount: number

  @Column()
  equityFromRsaPercent: number

  @Column()
  currentStatusTurnaroundTime: string

  // @Column()
  // mortgage_status_logs: IMortgageActivity[] | null

  // @Column()
  // mortgage_applicants: IMortgageApplicant[]

  // @Column()
  // mortgage_application_documents: IMortgageDocument[]
}