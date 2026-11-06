import { Mortgage } from '../mortgage/mortgage.entity';
import { Pmb } from '../pmb/pmb.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';

@Entity('new_mortgage_applicants')
export class MortgageApplicant {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: true })
  userId: number;

  @Column({ type: 'tinyint', width: 1, default: () => '1' })
  isPrincipalApplicant: boolean;

  @Column({ type: 'decimal', precision: 65, scale: 2, nullable: true })
  monthlyNetSalary: number;

  @Column({ type: 'text', nullable: true })
  currentEmployer: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  dob: string;

  @Column({ type: 'text', nullable: true })
  pfa: string;

  @Column({ type: 'int', nullable: true })
  preferredMortgageBank: number;

  @ManyToOne(() => Pmb, (pmb) => pmb.mortgageApplicants, {
    // eager: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    createForeignKeyConstraints: false
  })
  @JoinColumn({ name: 'preferred_mortgage_bank' })
  pmb: Pmb;

  @Column({ type: 'varchar', length: 255, nullable: true })
  accountNumber: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  accountName: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  bankName: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  bvn: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  statementTicketId: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  statementRequestId: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  statementPassword: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  tin: string;

  @CreateDateColumn({ type: 'datetime', nullable: true })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime', nullable: true })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'datetime', nullable: true })
  deletedAt: Date;

  @Column({ type: 'text', nullable: true })
  otherIncomes: string;

  @Column({ type: 'decimal', precision: 65, scale: 2, nullable: true })
  otherLoans: number;

  @ManyToOne(() => Mortgage, (application) => application.applicants, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'mortgage_application_id' })
  mortgage: Mortgage;

  @Column()
  mortgageApplicationId: number
}
