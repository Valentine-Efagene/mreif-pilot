import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsUrl } from 'class-validator';
import { Transform } from 'class-transformer';

export class BulkCreateRsaDocumentSingleDto {
  @ApiProperty()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  description?: string;

  @ApiProperty()
  @IsNotEmpty()
  @Transform(({ value }) => encodeURI(value))
  @IsUrl()
  url: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  size: number;
}

export class CreateRsaDocumentDto extends BulkCreateRsaDocumentSingleDto {
  @ApiProperty({ nullable: false, example: 1 })
  rsaId: number;
}

export class UpdateRsaDocumentDto {
  @ApiPropertyOptional({
    nullable: true,
    example: 'CAC'
  })
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    nullable: true,
    example: 'CAC'
  })
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    nullable: true,
    example: 'https://mofidevbucket.s3.us-east-1.amazonaws.com/rsa/document/test_document.pdf'
  })
  @IsOptional()
  @Transform(({ value }) => encodeURI(value))
  @IsUrl()
  url?: string;

  @ApiProperty({
    nullable: false,
    example: 400000
  })
  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  size?: number;
}