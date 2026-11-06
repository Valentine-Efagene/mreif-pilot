import { Cooperative } from './cooperative.entity';
import { PaginatedData } from '../common/common.type';

export class ICooperative {
  userId: number;
  employerName: string;
}

export interface ICreateCooperativeDto extends Partial<Omit<Cooperative, 'admin'>> {
  // userId: number;
}

export type IUpdateCooperativeDto = Partial<ICreateCooperativeDto>;

export class PaginatedCooperatives extends PaginatedData {
  data: Cooperative[];
}

export interface ISingleCooperativeStats {
  customersOnActiveLoans: number,
  customersOnPendingLoans: number,
  customersOnClosedLoans: number,
  customersOnCancelledLoans: number,
}