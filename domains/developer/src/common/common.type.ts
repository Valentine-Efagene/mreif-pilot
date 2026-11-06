export enum DocumentStatus {
  APPROVED = 'APPROVED',
  PENDING = 'PENDING',
  DECLINED = 'DECLINED',
}

export interface IDocument {
  url: string;
  name: string;
  description: string;
}