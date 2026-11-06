import { registerEnumType } from '@nestjs/graphql';

export enum CommissionStatus {
  PAID = 'PAID',
  PENDING = 'PENDING',
  DECLINED = 'DECLINED',
}

registerEnumType(CommissionStatus, {
  name: 'CommissionStatus', // This is the name that will appear in the GraphQL schema
  description: 'Commission Status', // Optional: description for the enum,
});
