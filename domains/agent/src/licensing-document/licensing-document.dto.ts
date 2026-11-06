import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { ArgsType, Field, Int } from '@nestjs/graphql';
import { DocumentStatus } from '../common/common.enum';

@ArgsType()
export class CreateLicensingDocumentResolverDto {
  @ApiProperty({ nullable: true, example: 1 })
  @Field(() => String)
  licensingInfoId: number;

  @ApiPropertyOptional({ nullable: true })
  name: string;

  @ApiPropertyOptional({ nullable: true })
  description: string;
}

@ArgsType()
export class CreateLicensingDocumentDto {
  @ApiProperty({ nullable: true, example: 1 })
  @Field(() => String)
  licensingInfoId: number;

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

@ArgsType()
export class UpdateLicensingDocumentDto {
  @ApiPropertyOptional({ nullable: true })
  name?: string;

  @ApiPropertyOptional({
    nullable: true,
    description: 'Optional new description for the file',
  })
  description?: string;

  @ApiPropertyOptional({ nullable: true })
  url?: string;
}

export class LicensingDocumentReuploadDto extends UpdateLicensingDocumentDto {
}

export class UpdateLicensingDocumentStatusDto {
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
