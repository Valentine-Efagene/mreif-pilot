import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('prod_wallets')
export class Wallet {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: false })
  userId: number;

  @Column({ type: 'enum', enum: ['USD', 'NGN'], nullable: false })
  currency: 'USD' | 'NGN';

  @Column({ type: 'varchar', length: 255, nullable: true })
  customerId: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  bankName: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  accountNumber: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  accountName: string | null;

  @Column({ type: 'decimal', precision: 65, scale: 2, default: '0.00' })
  balance: string;

  @CreateDateColumn({ type: 'datetime', nullable: true })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime', nullable: true })
  updatedAt: Date;
}
