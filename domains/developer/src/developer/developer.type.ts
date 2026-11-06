import { Developer } from './developer.entity';

export class IDeveloper {
  userId: number;
  businessName: string;
}

export interface ICreateDeveloperDto extends Partial<Omit<Developer, 'user'>> {
  userId: number;
}

export type IUpdateDeveloperDto = Partial<ICreateDeveloperDto>;
