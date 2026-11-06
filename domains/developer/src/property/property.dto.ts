import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';

export class CreatePropertyDto {
  @ApiProperty({
    nullable: false,
    example: 1
  })
  @IsNotEmpty()
  projectPropertyId: number;
}

export class UpdatePropertyDto {
}