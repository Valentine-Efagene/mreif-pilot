import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
} from 'typeorm';
//import { ProposedPropertyType } from './proposed-property.enums';
import { ProposedDevelopment } from '../proposed-development/proposed-development.entity';
import { AbstractBaseEntity } from '../common/common.pure.entity';
import { Property } from '../property/property.entity';

@Entity({ name: 'proposed-properties' })
export class ProposedProperty extends AbstractBaseEntity {
  @Column({ nullable: true })
  nUnits: number;

  @Column({ nullable: true })
  nBeds: number;

  @Column({ type: 'double precision', scale: 2, precision: 20, nullable: true })
  targetPrice: number;

  @Column()
  type: string;

  @ManyToOne(
    () => ProposedDevelopment,
    (proposedDevelopment) => proposedDevelopment.proposedProperties,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'proposed_development_id' })
  proposedDevelopment: ProposedDevelopment;

  @OneToOne(
    () => Property,
    (property) => property.proposedProperty,
  )
  property: Property;

  @Column()
  proposedDevelopmentId: number
}
