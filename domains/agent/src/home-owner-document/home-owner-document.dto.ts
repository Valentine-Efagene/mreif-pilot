import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { DocumentStatus } from '../common/common.enum';

export class CreateHomeOwnerDocumentDto {
  @ApiProperty({ nullable: false, example: 1 })
  @IsNotEmpty()
  homeOwnerId: number;

  @ApiProperty({ nullable: false })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ nullable: false })
  @IsNotEmpty()
  description: string;

  @ApiProperty({ nullable: false })
  @IsNotEmpty()
  url: string;

  @ApiProperty({ nullable: false })
  @IsNotEmpty()
  @IsNumber()
  size: number;
}

export class UpdateHomeOwnerDocumentDto {
  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    nullable: true,
    description: 'Optional new description for the file',
  })
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  url?: string;

  @ApiProperty({ nullable: true })
  @IsOptional()
  @IsNumber()
  size?: number;
}

export class HomeOwnerDocumentReuploadDto extends UpdateHomeOwnerDocumentDto {
}

export class UpdateHomeOwnerDocumentStatusDto {
  @ApiProperty({
    nullable: false,
    enum: DocumentStatus,
    example: DocumentStatus.APPROVED,
  })
  @IsNotEmpty()
  @IsEnum(DocumentStatus)
  status: DocumentStatus;

  @ApiPropertyOptional({
    description: 'Required for declines',
  })
  declineReason?: string;

  @ApiProperty({ nullable: false, example: 1 })
  @IsNotEmpty()
  reviewerId: number;
}

export class BulkCreateHomeOwnerDocumentSingleDto {
  @ApiPropertyOptional({ nullable: true })
  name: string;

  @ApiPropertyOptional({ nullable: true })
  description: string;

  @ApiPropertyOptional({ nullable: true })
  url: string;

  @ApiProperty({ nullable: false })
  @IsNotEmpty()
  @IsNumber()
  size: number;
}