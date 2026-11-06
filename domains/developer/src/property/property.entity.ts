import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { ProposedProperty } from '../proposed-property/proposed-property.entity';
import { AbstractBaseEntity } from '../common/common.pure.entity';
import { PropertyStatus } from './property.enums';

@Entity({ name: 'properties' })
export class Property extends AbstractBaseEntity {
  @OneToOne(
    () => ProposedProperty,
    (proposedProperty) => proposedProperty.property,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'project_property_id' })
  proposedProperty: ProposedProperty;

  @Column()
  projectPropertyId: number

  @Column({
    type: 'enum',
    enum: PropertyStatus,
    default: PropertyStatus.PENDING
  })
  status: PropertyStatus
}
