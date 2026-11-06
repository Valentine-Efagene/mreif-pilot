import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Field, Int, ObjectType } from '@nestjs/graphql';
import { AbstractBaseDocumentEntity } from '../common/common.entity';
import { LicensingInfo } from '../licensing-info/licensing-info.entity';

@ObjectType({ description: 'licensing document' })
@Entity({ name: 'licensing_documents' })
export class LicensingDocument extends AbstractBaseDocumentEntity {
  @Field(() => LicensingInfo)
  @ManyToOne(
    () => LicensingInfo,
    (licensingInfo) => licensingInfo.licensingDocuments,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'licensing_info_id' })
  licensingInfo: LicensingInfo;

  @Field(() => Int)
  @Column({ nullable: true })
  licensingInfoId: number;
}
