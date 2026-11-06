import { Developer } from '../developer/developer.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { PreferredContactMethod } from './developer-poc.enums';
import { AbstractBaseEntity } from '../common/common.pure.entity';

@Entity({ name: 'developer_pocs' })
export class DeveloperPoc extends AbstractBaseEntity {
  @Column()
  name: string;

  @Column()
  position: string;

  @Column()
  businessAddress: string;

  @Column()
  state: string;

  @Column()
  country: string;

  @Column()
  phoneNumber: string;

  @Column()
  email: string;

  @Column({
    type: 'enum',
    enum: PreferredContactMethod,
  })
  preferredContactMethod: PreferredContactMethod;

  @OneToOne(() => Developer, (developer) => developer.developerPoc)
  @JoinColumn({
    name: 'developer_id'
  })
  developer: Developer;

  @Column()
  developerId: number
}
