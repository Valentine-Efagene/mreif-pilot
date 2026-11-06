import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { PreferredContactMethod } from './agent-poc.enums';
import { AbstractBaseEntity } from '../common/common.pure.entity';
import { Agent } from '../agent/agent.entity';

@Entity({ name: 'agent_pocs' })
export class AgentPoc extends AbstractBaseEntity {
  @Column({
    nullable: true
  })
  firstName: string;

  @Column({
    nullable: true
  })
  lastName: string;

  @Column({
    nullable: true
  })
  address: string;

  @Column({
    nullable: true
  })
  state: string;

  @Column({
    nullable: true
  })
  country: string;

  @Column({
    nullable: true
  })
  phoneNumber: string;

  @Column({
    nullable: true
  })
  email: string;

  @Column({
    type: 'enum',
    enum: PreferredContactMethod,
    default: PreferredContactMethod.PHONE_NUMBER
  })
  preferredContactMethod: PreferredContactMethod;

  @OneToOne(() => Agent, (agent) => agent.poc, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({
    name: 'agent_id'
  })
  agent: Agent;

  @Column()
  agentId: number
}
