import { Column, Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { User } from '../user/user.entity';
import { Field, ObjectType } from '@nestjs/graphql';
import { CreateHomeOwnerDto } from './home-owner.dto';
import { HomeOwnerDocument } from '../home-owner-document/home-owner-document.entity';
import { AbstractBaseReviewableEntity } from '../common/common.entity';
import { Status } from '../common/common.type';
import { HomeOwnerPoc } from '../home-owner-poc/home-owner-poc.entity';

@ObjectType({ description: 'home owner' })
@Entity({ name: 'home_owners' })
export class HomeOwner extends AbstractBaseReviewableEntity {
  constructor(data?: CreateHomeOwnerDto & { status: Status }) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }

  @Field(() => User)
  @OneToOne(() => User, {
    // eager: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToOne(() => HomeOwnerPoc, (poc) => poc.homeOwner)
  poc: HomeOwnerPoc;

  @Field(() => String)
  @Column({ nullable: true })
  userId: number;

  @Field(() => [HomeOwnerDocument])
  @OneToMany(() => HomeOwnerDocument, (homeOwnerDocument) => homeOwnerDocument.homeOwner)
  documents: HomeOwnerDocument[];

  @Field(() => String)
  @Column({
    nullable: true
  })
  bankName: string;

  @Field(() => String)
  @Column({
    nullable: true
  })
  accountName: string;

  @Field(() => String)
  @Column({
    nullable: true
  })
  accountNumber: string;

  @Column({
    type: 'enum',
    enum: Status,
    default: Status.PENDING,
  })
  @Field()
  status: Status;

  @Field()
  @Column({ nullable: true })
  comment: string;
}
