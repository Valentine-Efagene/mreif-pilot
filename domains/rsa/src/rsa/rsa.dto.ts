import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEnum, IsInt, IsNotEmpty, IsOptional, ValidateNested } from 'class-validator';
import { BulkCreateRsaDocumentSingleDto } from '../rsa-document/rsa-document.dto';
import { RsaStatus } from './rsa.enums';

export class LogoUploadDto {
  @ApiProperty({
    format: 'binary',
    description:
      'Image with max size of 10MB. The image will be resized before upload',
    example: 'example.jpg',
  })
  @IsNotEmpty()
  file: Express.Multer.File;
}

export class UpdateRsaDto {
}

export class CreateRsaDto extends UpdateRsaDto {
  @ApiProperty({ nullable: false, example: 1 })
  @IsNotEmpty()
  @IsInt()
  mortgageId?: number;

  @ApiProperty({ nullable: false, example: 'PEN-454546566' })
  @IsNotEmpty()
  rsa: string;

  @ApiProperty({ nullable: false, example: 'Homebase' })
  @IsNotEmpty()
  pfa: string;

  @ApiPropertyOptional({ type: [BulkCreateRsaDocumentSingleDto], description: 'Array of RSA documents' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkCreateRsaDocumentSingleDto)
  rsaDocuments: BulkCreateRsaDocumentSingleDto[];
}

export class UpdateRsaStatusDto {
  @ApiProperty({
    nullable: false,
    enum: RsaStatus,
    example: RsaStatus.APPROVED,
  })
  @IsNotEmpty()
  @IsEnum(RsaStatus)
  status: RsaStatus;

  @ApiPropertyOptional({
    description: 'Required for declines'
  })
  comment: string;

  @ApiProperty({ nullable: false, example: 1 })
  @IsNotEmpty()
  reviewerId: number;
}