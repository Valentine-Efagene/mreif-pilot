import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { Rsa } from '../rsa/rsa.entity';
import { AbstractBaseDocumentEntity } from '../common/common.entity';

@Entity({ name: 'rsa-documents' })
export class RsaDocument extends AbstractBaseDocumentEntity {
  @ManyToOne(() => Rsa, (rsa) => rsa.rsaDocuments, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'rsa_id' })
  rsa: Rsa;

  @Column()
  rsaId: number;
}
