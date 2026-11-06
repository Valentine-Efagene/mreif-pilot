import { User } from '../../../../domains/agent/src/user/user.entity';
import { Agent } from '../../../../domains/agent/src/agent/agent.entity';
import { AgentPoc } from '../../../../domains/agent/src/agent-poc/agent-poc.entity';
import { Commission } from '../../../../domains/agent/src/commission/commission.entity';
import { HomeOwner } from '../../../../domains/agent/src/home-owner/home-owner.entity';
import { HomeOwnerDocument } from '../../../../domains/agent/src/home-owner-document/home-owner-document.entity';
import { HomeOwnerPoc } from '../../../../domains/agent/src/home-owner-poc/home-owner-poc.entity';
import { LicensingDocument } from '../../../../domains/agent/src/licensing-document/licensing-document.entity';
import { LicensingInfo } from '../../../../domains/agent/src/licensing-info/licensing-info.entity';
import { Referral } from '../../../../domains/agent/src/referral/referral.entity';

export const AGENT_ENTITIES = [
  User,
  Agent,
  AgentPoc,
  Commission,
  HomeOwner,
  HomeOwnerDocument,
  HomeOwnerPoc,
  LicensingDocument,
  LicensingInfo,
  Referral,
];

export const AGENT_CONNECTION = 'agent';
