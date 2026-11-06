import { User } from '../user/user.entity';
import {
  Column,
  Entity,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { AbstractBaseEntity } from '../common/common.pure.entity';

@Entity({ name: 'cooperatives' })
export class Cooperative extends AbstractBaseEntity {
  @Column({ type: 'text', nullable: true })
  logo: string;

  @OneToOne(() => User, {
    //eager: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  admin: User;

  @OneToMany(() => User, user => user.cooperative)
  members: User[]

  @Column({
    nullable: true,
    comment: "Admin user id"
  })
  userId?: number;

  @Column({ nullable: true, unique: true })
  name: string;

  @Column({ nullable: true })
  mobile: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true, unique: true })
  email: string;

  @Column({ nullable: true, unique: true })
  website: string;

  @Column({ nullable: true })
  postalAddress: string;

  @Column({ nullable: true })
  headOfficeAddress: string;
}
