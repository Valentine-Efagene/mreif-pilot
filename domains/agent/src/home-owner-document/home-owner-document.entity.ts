import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Field, Int, ObjectType } from '@nestjs/graphql';
import { AbstractBaseDocumentEntity } from '../common/common.entity';
import { HomeOwner } from '../home-owner/home-owner.entity';

@ObjectType({ description: 'home owner document' })
@Entity({ name: 'home_owner_documents' })
export class HomeOwnerDocument extends AbstractBaseDocumentEntity {
  @Field(() => HomeOwner)
  @ManyToOne(
    () => HomeOwner,
    (homeOwner) => homeOwner.documents,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'home_owner_id' })
  homeOwner: HomeOwner;

  @Field(() => Int)
  @Column({ nullable: true })
  homeOwnerId: number;
}
