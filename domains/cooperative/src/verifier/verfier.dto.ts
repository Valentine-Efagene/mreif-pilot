import { ApiProperty } from '@nestjs/swagger';

export enum BusinessType {
  BN = 'bn',
  CO = 'co',
}

export class RcVerificationDto {
  @ApiProperty({
    example: '0000000',
  })
  rcNumber: string;

  @ApiProperty({
    type: 'enum',
    enum: BusinessType,
    default: BusinessType.CO,
  })
  businessType: BusinessType;
}

export class AccountNumberVerificationDto {
  @ApiProperty({
    example: '32834734348',
  })
  accountNumber: string;
}
