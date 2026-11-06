import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { DocumentStatus } from '../common/common.enum';

export class CreateLicensingInfoControllerDto {
  @ApiPropertyOptional({ nullable: true })
  @IsNotEmpty()
  url: string;

  @ApiPropertyOptional({ nullable: true })
  @IsNotEmpty()
  regulatoryBody: string;

  @ApiProperty({ nullable: false })
  @IsNotEmpty()
  @Type(() => Number)
  agentId: number;
}

export class CreateLicensingInfoDto {
  @ApiProperty({
    type: 'number',
    example: 1,
  })
  agentId: number;

  @ApiPropertyOptional({ nullable: true })
  @IsNotEmpty()
  regulatoryBody: string;

  @ApiPropertyOptional({ nullable: true })
  url: string;

  @ApiPropertyOptional({ nullable: false })
  @IsOptional()
  @IsNumber()
  size?: number;
}

export class BulkCreateLicensingInfoDocumentSingleDto {
  @ApiPropertyOptional({ nullable: true, example: 'Corporate Affairs Commission' })
  @IsNotEmpty()
  regulatoryBody: string;

  @ApiPropertyOptional({ nullable: true, example: 'https://safe-document.pdf' })
  url: string;

  @ApiPropertyOptional({ nullable: false, example: 4553300 })
  @IsOptional()
  @IsNumber()
  size?: number;
}

export class UpdateLicensingInfoDto {
  @ApiPropertyOptional({ nullable: true })
  @IsNotEmpty()
  regulatoryBody: string;

  @ApiPropertyOptional({ nullable: true })
  url?: string;
}

export class LicensingInfoReuploadDto extends UpdateLicensingInfoDto {
}

export class UpdatePublicationStatusDto {
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
  declineReason: string;

  @ApiProperty({ nullable: false, example: 1 })
  @IsNotEmpty()
  reviewerId: number;
}
