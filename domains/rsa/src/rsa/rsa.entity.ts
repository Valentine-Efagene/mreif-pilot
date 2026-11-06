import {
  Column,
  Entity,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { RsaDocument } from '../rsa-document/rsa-document.entity';
import { Mortgage } from '../mortgage/mortgage.entity';
import { AbstractBaseReviewableEntity } from '../common/common.entity';
import { RsaStatus } from './rsa.enums';

@Entity({ name: 'rsa-applications' })
export class Rsa extends AbstractBaseReviewableEntity {
  @OneToMany(() => RsaDocument, rsaDocument => rsaDocument.rsa)
  rsaDocuments: RsaDocument[];

  @OneToOne(() => Mortgage, {
    //eager: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'mortgage_id' })
  mortgage: Mortgage;

  @Column({ nullable: false })
  mortgageId?: number;

  @Column({ nullable: false })
  pfa: string;

  @Column({ nullable: false })
  rsa: string;

  @Column({
    nullable: true,
    type: 'enum',
    enum: RsaStatus,
    default: RsaStatus.PENDING
  })
  status: RsaStatus
}
