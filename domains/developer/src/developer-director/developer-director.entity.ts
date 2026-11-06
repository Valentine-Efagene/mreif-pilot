import { DeveloperDirectorDocument } from '../developer-director-document/developer-director-document.entity';
import { Developer } from '../developer/developer.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { AbstractBaseEntity } from '../common/common.pure.entity';

@Entity({ name: 'developer_directors' })
export class DeveloperDirector extends AbstractBaseEntity {
  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  homeAddress: string;

  @Column({ type: 'date' })
  dateOfBirth: string;

  @Column({
    nullable: true
  })
  bvn: string;

  @Column()
  phoneNumber: string;

  @Column()
  email: string;

  @ManyToOne(() => Developer, (developer) => developer.developerDirectors, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'developer_id' })
  developer: Developer;

  @Column()
  developerId: number;

  @OneToMany(
    () => DeveloperDirectorDocument,
    (developerDirectorDocument) => developerDirectorDocument.developerDirector,
    { eager: true },
  )
  developerDirectorDocuments: DeveloperDirectorDocument[];
}
