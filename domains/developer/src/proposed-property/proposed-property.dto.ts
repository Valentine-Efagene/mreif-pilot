import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';

export class CreateProposedPropertyNoRelDto {
  @ApiProperty({ nullable: false })
  @IsNotEmpty()
  @IsString()
  type: string;

  @ApiProperty({ nullable: false })
  @IsNotEmpty()
  @IsInt()
  nUnits: number;

  @ApiProperty({ nullable: false })
  @IsNotEmpty()
  @IsInt()
  nBeds: number;

  @ApiProperty({
    nullable: false,
    example: 500000000
  })
  @IsNotEmpty()
  @IsNumber()
  targetPrice: number;
}

export class CreateProposedPropertyDto extends CreateProposedPropertyNoRelDto {
  @ApiProperty({
    nullable: false,
    example: 1
  })
  @IsNotEmpty()
  proposedDevelopmentId: number;
}

export class UpdateProposedPropertyDto {
  @ApiPropertyOptional({
    nullable: true,
    example: 'Bungalow'
  })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsInt()
  nUnits: number;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsInt()
  nBeds: number;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsNumber()
  targetPrice: number;
}

export class CreateManyProposedPropertiesDto {
  @ApiProperty({
    example: 1,
  })
  @IsNotEmpty()
  proposedDevelopmentId: number;

  @ApiProperty({
    type: [CreateProposedPropertyNoRelDto],
    example: [
      {
        type: 'Bungalow',
        nUnits: 5,
        nBeds: 3,
        targetPrice: 50000000,
      },
      {
        type: 'Bungalow',
        nUnits: 5,
        nBeds: 3,
        targetPrice: 50000000,
      },
      {
        type: 'Bungalow',
        nUnits: 5,
        nBeds: 3,
        targetPrice: 50000000,
      },
      {
        type: 'Bungalow',
        nUnits: 5,
        nBeds: 3,
        targetPrice: 50000000,
      },
    ],
    description: 'Array of group entities to create',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProposedPropertyNoRelDto)
  proposedProperties: CreateProposedPropertyNoRelDto[];
}