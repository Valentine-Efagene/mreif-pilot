import { Pmb } from './pmb.entity';
import { PaginatedData } from '../common/common.type';

export class IPmb {
  userId: number;
  employerName: string;
}

export interface ICreatePmbDto extends Partial<Omit<Pmb, 'admin'>> {
  // userId: number;
}

export type IUpdatePmbDto = Partial<ICreatePmbDto>;

export class PaginatedPmbs extends PaginatedData {
  data: Pmb[];
}

export interface ISinglePmbStats {
  customersOnActiveLoans: number,
  customersOnPendingLoans: number,
  customersOnClosedLoans: number,
  customersOnCancelledLoans: number,
}

export interface IGithubResource {
  name: string
  path: string
  size: number
  url: string
  download_url: string | null
  type: 'dir' | 'file'
}