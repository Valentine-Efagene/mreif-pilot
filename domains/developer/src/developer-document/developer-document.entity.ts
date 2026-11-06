import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { Developer } from '../developer/developer.entity';
import { AbstractBaseDocumentEntity } from '../common/common.entity';

@Entity({ name: 'developer-documents' })
export class DeveloperDocument extends AbstractBaseDocumentEntity {
  @ManyToOne(() => Developer, (developer) => developer.developerDocuments, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'developer_id' })
  developer: Developer;

  @Column()
  developerId: number;
}
