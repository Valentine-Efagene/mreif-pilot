import { HomeOwner } from '../home-owner/home-owner.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { PreferredContactMethod } from './home-owner-poc.enums';
import { AbstractBaseEntity } from '../common/common.pure.entity';

@Entity({ name: 'home_owner_pocs' })
export class HomeOwnerPoc extends AbstractBaseEntity {
  @Column()
  name: string;

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
    default: PreferredContactMethod.PHONE_NUMBER
  })
  preferredContactMethod: PreferredContactMethod;

  @OneToOne(() => HomeOwner, (homeOwner) => homeOwner.poc, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({
    name: 'home_owner_id'
  })
  homeOwner: HomeOwner;

  @Column()
  homeOwnerId: number
}
