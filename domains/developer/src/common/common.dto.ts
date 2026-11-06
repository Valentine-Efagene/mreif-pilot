import { ApiExtraModels, ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsEnum, IsString, IsNumberString, IsNumber, IsOptional, IsUrl, IsInt } from 'class-validator';
import { DocumentStatus } from './common.type';
import { DocumentModule } from './common.enum';
import { Transform } from 'class-transformer';

export class Document {
  url: string;
  name: string;
  description: string;
}

// export class IdDto {
//   @ApiProperty({
//     type: 'number',
//   })
//   @IsNotEmpty({ message: 'ID parameter is required' })
//   @IsNumberString()loca
//   id: number;
// }

export class ApproveDocumentDto {
  @ApiProperty({ nullable: false, example: 1 })
  @IsNotEmpty()
  reviewerId: number;
}

export class UpdateDocumentStatusDto {
  @ApiProperty({
    nullable: false,
    enum: DocumentStatus,
    example: DocumentStatus.APPROVED,
  })
  @IsNotEmpty()
  @IsEnum(DocumentStatus)
  status: DocumentStatus;

  @ApiPropertyOptional({
    description: 'Required for declines'
  })
  @IsOptional()
  declineReason?: string;

  @ApiProperty({ nullable: false, example: 1 })
  @IsNotEmpty()
  reviewerId: number;
}


export class UpdateDocumentDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'The file to be uploaded',
    example: 'example.pdf',
  })
  file?: Express.Multer.File;

  @ApiPropertyOptional({ nullable: true })
  name?: string;

  @ApiPropertyOptional({ nullable: true })
  description?: string;

  @ApiPropertyOptional({ nullable: true })
  url?: string;

  @ApiPropertyOptional({ nullable: false })
  @IsOptional()
  @IsString()
  declineReason?: string;

  @IsOptional()
  @IsString()
  reviewerId?: number;

  @IsOptional()
  @IsString()
  reviewedAt?: string;
}

export class DeclineDocumentDto {
  @ApiProperty({ nullable: false })
  @IsNotEmpty()
  @IsString()
  declineReason?: string;

  @ApiProperty({ nullable: false, example: 1 })
  @IsNotEmpty()
  @IsString()
  reviewerId: number;
}

@ApiExtraModels(StandardApiResponse)
export class StandardApiResponse<T = any> {
  statusCode: number;
  message: string;
  data?: T;

  constructor(statusCode: number, message: string, data?: T) {
    this.message = message;
    this.statusCode = statusCode;
    this.data = data;
  }
}

export class DocumentReuploadDto {
  @ApiProperty({
    nullable: false,
    description: 'ID of the file to replace'
  })
  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  id: number;

  @ApiProperty({
    nullable: false,
    description: 'Size of the file in bytes'
  })
  @Transform(({ value }) => parseInt(value, 10), { toClassOnly: true })
  @IsOptional()
  @IsNumber()
  size: number;

  @ApiPropertyOptional({
    nullable: true,
    description: 'Optional new name for the file'
  })
  name?: string;

  @ApiProperty({
    nullable: true,
    description: 'Optional new name for the file'
  })
  @IsNotEmpty()
  @Transform(({ value }) => encodeURI(value))
  @IsUrl()
  url: string;

  @ApiPropertyOptional({
    nullable: true,
    description: 'Optional new description for the file'
  })
  description?: string;

  @ApiProperty({
    nullable: false,
    type: 'enum',
    enum: DocumentModule,
    description: 'The type of document you are trying to replace.'
  })
  @IsNotEmpty()
  module: DocumentModule;
}