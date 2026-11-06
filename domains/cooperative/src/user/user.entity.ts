import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { UserRole } from './user.enums';
import { Cooperative } from '../cooperative/cooperative.entity';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

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

  @ManyToOne(() => Cooperative, {
    //eager: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'cooperative_id' })
  cooperative?: Cooperative;

  @Column({ nullable: true })
  cooperativeId?: number;

  @Column({ nullable: true })
  pmbEmployerId?: number;

  @Column({ nullable: true })
  pmbParentId?: number;

  @Column({ default: false })
  suspended: boolean;
}