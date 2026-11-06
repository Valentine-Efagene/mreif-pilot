import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';
import { MortgageStatus, RequestType } from './mortgage-applicant.enums';
import { Transform } from 'class-transformer';

export class CreateMortgageDto {
  @ApiProperty({ nullable: false })
  @IsNotEmpty()
  userId: number

  @ApiProperty({ nullable: false })
  @IsNotEmpty()
  mortgageApplicationId: number

  @ApiProperty({
    type: 'boolean',
    example: true
  })
  isPrincipalApplicant: boolean

  @ApiProperty({
    type: 'number',
    example: true
  })
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  preferredMortgageBank: number
}

export class UpdateMortgageDto {
  @ApiPropertyOptional({ nullable: true })
  id?: number;

  @ApiPropertyOptional({
    type: 'boolean',
    example: true
  })
  isPrincipalApplicant: boolean

  @ApiPropertyOptional({
    type: 'number',
    example: true
  })
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  preferredMortgageBank: number
}