import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { AbstractBaseEntity } from '../common/common.pure.entity';
import { Field, ObjectType } from '@nestjs/graphql';
import { LicensingDocument } from '../licensing-document/licensing-document.entity';
import { Agent } from '../agent/agent.entity';

@ObjectType({ description: 'licensing information' })
@Entity({ name: 'licensing_info' })
export class LicensingInfo extends AbstractBaseEntity {
  @Field(() => Agent)
  @ManyToOne(() => Agent, (agent) => agent.licensingInfo, {
    //eager: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'agent_id' })
  agent: Agent;

  @Column({ nullable: true })
  agentId: number;

  @Field(() => [LicensingDocument])
  @OneToMany(
    () => LicensingDocument,
    (licensingDocument) => licensingDocument.licensingInfo,
    { eager: true },
  )
  licensingDocuments: LicensingDocument[];

  @Field(() => String)
  @Column({
    nullable: true,
  })
  regulatoryBody: string;
}
