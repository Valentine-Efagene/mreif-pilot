import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateMortgageDto {
  @ApiProperty({ nullable: false })
  @IsNotEmpty()
  userId: number
}

export class UpdateMortgageDto {
  @ApiPropertyOptional({ nullable: true })
  id?: number;
}