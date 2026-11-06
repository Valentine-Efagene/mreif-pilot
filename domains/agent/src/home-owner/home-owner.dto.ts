import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, MaxLength, ValidateNested } from 'class-validator';
import { ArgsType, Field, Int, ObjectType } from '@nestjs/graphql';
import { HomeOwner } from './home-owner.entity';
import { PaginationDto, PaginationMeta } from '../common/common.dto';
import { Type } from 'class-transformer';
import { BulkCreateHomeOwnerDocumentSingleDto } from '../home-owner-document/home-owner-document.dto';
import { Status } from '../common/common.type';
import { BulkCreateHomeOwnerPocDto } from '../home-owner-poc/home-owner-poc.dto';

@ArgsType()
export class CreateHomeOwnerDto {
  @ApiProperty({ nullable: true, example: 1 })
  @Field(() => Int)
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  userId: number;

  @ApiProperty({
    example: 'Access Bank Plc',
  })
  @IsOptional()
  @MaxLength(255)
  bankName: string;

  @ApiProperty({
    example: 'Johnny Ufuoma',
  })
  @IsOptional()
  @MaxLength(255)
  accountName: string;

  @ApiProperty({
    example: '948409362536',
  })
  @IsOptional()
  @MaxLength(255)
  accountNumber: string;

  @ApiPropertyOptional({ type: [BulkCreateHomeOwnerDocumentSingleDto], description: 'Home Owner Documents' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkCreateHomeOwnerDocumentSingleDto)
  documents?: BulkCreateHomeOwnerDocumentSingleDto[];

  @ApiPropertyOptional({ type: BulkCreateHomeOwnerPocDto, description: 'Home Owner POC' })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => BulkCreateHomeOwnerPocDto)
  poc?: BulkCreateHomeOwnerPocDto;
}

@ArgsType()
export class UpdateHomeOwnerDto {
  @ApiProperty({ nullable: true, example: 1 })
  @Field(() => Int)
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  id: number;

  @ApiPropertyOptional({
    example: '06045362536',
  })
  @MaxLength(255)
  @IsOptional()
  phone: string;

  @ApiPropertyOptional({
    example: 'Access Bank Plc',
  })
  @MaxLength(255)
  @IsOptional()
  bankName: string;

  @ApiPropertyOptional({
    example: 'Johnny Ufuoma',
  })
  @MaxLength(255)
  @IsOptional()
  accountName: string;

  @ApiPropertyOptional({
    example: '948409362536',
  })
  @IsOptional()
  @MaxLength(255)
  accountNumber: string;
}

@ObjectType()
export class PaginatedHomeOwners {
  @Field(() => [HomeOwner])
  data: HomeOwner[];

  @Field(() => PaginationMeta)
  meta: PaginationMeta;
}

@ObjectType()
export class ReferreePaginationDto extends PaginationDto {
}

export class UpdateHomeOwnerStatusDto {
  @ApiProperty({
    nullable: false,
    enum: Status,
    example: Status.APPROVED,
  })
  @IsNotEmpty()
  @IsEnum(Status)
  status: Status;

  @ApiPropertyOptional({
    description: 'Required for declines',
  })
  comment: string;

  @ApiProperty({ nullable: false, example: 1 })
  @IsNotEmpty()
  reviewerId: number;
}