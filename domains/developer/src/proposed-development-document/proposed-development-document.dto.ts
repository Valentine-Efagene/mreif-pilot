import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsNumber, IsOptional, ValidateNested } from 'class-validator';

export class CreateProposedDevelopmentDocumentDto {
  @ApiPropertyOptional({ nullable: false })
  @Transform(({ value }) => parseInt(value, 10), { toClassOnly: true })
  @IsOptional()
  @IsNumber()
  size: number;

  @ApiProperty({ nullable: true })
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ nullable: true })
  @IsNotEmpty()
  description: string;

  @ApiProperty({ nullable: false })
  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value, 10), { toClassOnly: true })
  proposedDevelopmentId: number;

  @ApiPropertyOptional({ nullable: true })
  url: string;
}

export class UpdateProposedDevelopmentDocumentDto extends CreateProposedDevelopmentDocumentDto { }

export class BulkCreateProposedDevelopmentDocumentDto extends OmitType(CreateProposedDevelopmentDocumentDto, ['proposedDevelopmentId'] as const) {

}

export class CreateManyProposedDevelopmentDocumentsDto {
  @ApiProperty({
    example: 1,
  })
  @Transform(({ value }) => parseInt(value, 10), { toClassOnly: true })
  @IsNotEmpty()
  proposedDevelopmentId: number;


  @ApiProperty({
    type: [BulkCreateProposedDevelopmentDocumentDto],
    description: 'Array of Group Entities',
    example: [
      {
        name: 'Meta',
        rcNumber: 'FJCW940F9W09FJW',
      },
      {
        name: 'Meta2',
        rcNumber: 'FJCW940F9W09FJW',
      },
      {
        name: 'Meta3',
        rcNumber: 'FJCW940F9W09FJW',
      },
    ],
  })
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkCreateProposedDevelopmentDocumentDto)
  documents: BulkCreateProposedDevelopmentDocumentDto[];
}
