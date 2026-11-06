import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { DeveloperDirector } from '../developer-director/developer-director.entity';
import { AbstractBaseDocumentEntity } from '../common/common.entity';

@Entity({ name: 'developer-director-documents' })
export class DeveloperDirectorDocument extends AbstractBaseDocumentEntity {
  @ManyToOne(() => DeveloperDirector, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'developer_director_id' })
  developerDirector: DeveloperDirector;

  @Column()
  developerDirectorId: number;
}
