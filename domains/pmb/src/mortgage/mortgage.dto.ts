import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { MortgageStatus, RequestType } from './mortgage.enums';

export class CreateMortgageDto {
  @ApiProperty({ nullable: false })
  @IsNotEmpty()
  userId: number

  @ApiProperty()
  unitId: number

  @ApiPropertyOptional({
    type: 'enum',
    enum: MortgageStatus
  })
  status: MortgageStatus

  @ApiPropertyOptional({
    type: 'enum',
    enum: RequestType
  })
  type: RequestType

  @ApiPropertyOptional()
  isJoint: boolean

  @ApiProperty()
  buildingId: number

  @ApiProperty()
  propertyId: number

  @ApiPropertyOptional()
  applicationId: number

  @ApiPropertyOptional()
  loanAmount: number

  @ApiPropertyOptional()
  rsaBalance: number

  @ApiPropertyOptional()
  loanPercent: number

  @ApiProperty()
  equityAmount: number

  @ApiProperty()
  propertyCost: number

  @ApiPropertyOptional()
  equityPercent?: number

  @ApiPropertyOptional()
  monthlyPayment?: number

  @ApiPropertyOptional()
  userNextAction?: string | null

  @ApiPropertyOptional()
  adminNextAction?: string

  @ApiPropertyOptional()
  durationInMonths?: number

  @ApiPropertyOptional()
  equityWithoutRsa?: number

  @ApiPropertyOptional()
  interestPerAnnum?: number

  @ApiPropertyOptional()
  currentStatusReason?: string | null

  @ApiPropertyOptional()
  equityFromRsaAmount?: number

  @ApiPropertyOptional()
  equityFromRsaPercent?: number

  @ApiPropertyOptional()
  currentStatusTurnaroundTime?: string
}

export class UpdateMortgageDto {
  @ApiPropertyOptional({ nullable: true })
  id?: number;
}