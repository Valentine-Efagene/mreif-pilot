import { Rsa } from './rsa.entity';
import { PaginatedData } from '../common/common.type';

export class IRsa {
  userId: number;
  employerName: string;
}

export interface ICreateRsaDto extends Partial<Omit<Rsa, 'admin'>> {
  // userId: number;
}

export type IUpdateRsaDto = Partial<ICreateRsaDto>;

export class PaginatedRsa extends PaginatedData {
  data: Rsa[];
}