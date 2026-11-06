import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { Developer } from '../developer/developer.entity';
import { AbstractBaseEntity } from '../common/common.pure.entity';

@Entity({ name: 'group-entities' })
export class GroupEntity extends AbstractBaseEntity {
  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  rcNumber: string;

  @ManyToOne(() => Developer, (developer) => developer.groupEntities, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'developer_id' })
  developer: Developer;
}
