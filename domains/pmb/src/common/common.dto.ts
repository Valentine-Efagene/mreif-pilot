import { ApiExtraModels, ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsEnum, IsString } from 'class-validator';
import { DocumentStatus } from './common.type';

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
//   @IsNumberString()
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
  declineReason: string;

  @ApiProperty({ nullable: false, example: 1 })
  @IsNotEmpty()
  reviewerId: number;
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
