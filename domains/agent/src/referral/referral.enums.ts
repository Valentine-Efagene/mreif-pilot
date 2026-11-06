import { registerEnumType } from '@nestjs/graphql';

export enum AgentType {
  INDIVIDUAL = 'INDIVIDUAL',
  ORGANISATION = 'ORGANISATION',
}

registerEnumType(AgentType, {
  name: 'AgentType', // This is the name that will appear in the GraphQL schema
  description: 'Agent type', // Optional: description for the enum,
});
