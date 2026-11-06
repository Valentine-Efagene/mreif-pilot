import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { ProposedDevelopment } from '../proposed-development/proposed-development.entity';
import { AbstractBaseDocumentEntity } from '../common/common.entity';

@Entity({ name: 'proposed-development-documents' })
export class ProposedDevelopmentDocument extends AbstractBaseDocumentEntity {
  @ManyToOne(() => ProposedDevelopment,
    developer => developer.proposedDevelopmentDocuments, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'proposed_development_id' })
  proposedDevelopment: ProposedDevelopment;

  @Column()
  proposedDevelopmentId: number;
}
