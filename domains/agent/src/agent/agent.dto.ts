import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AgentType } from './agent.enums';
import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, MaxLength, ValidateNested } from 'class-validator';
import { ArgsType, Field, Int, ObjectType } from '@nestjs/graphql';
import { Agent } from './agent.entity';
import { PaginationDto, PaginationMeta } from '../common/common.dto';
import { Type } from 'class-transformer';
import { BulkCreateLicensingInfoDocumentSingleDto } from '../licensing-info/licensing-info.dto';
import IsNotForIndividual from '../common/validation/IsNotForIndividual';
import IsRequiredForCompanies from '../common/validation/IsRequiredForCompanies';
import { Status } from '../common/common.type';
import { BulkCreateAgentPocDto } from '../agent-poc/agent-poc.dto';

@ArgsType()
export class CreateAgentDto {
  @ApiProperty({ nullable: true, example: 1 })
  @Field(() => Int)
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  userId: number;

  @ApiProperty({ example: AgentType.INDIVIDUAL })
  @Field(() => AgentType)
  @IsNotEmpty()
  @MaxLength(255)
  agentType: AgentType;

  @ApiProperty({
    example: 'Mr',
  })
  @IsOptional()
  @MaxLength(255)
  title: string;

  @ApiProperty({
    example: 'Johnny Ufuoma',
  })
  @IsOptional()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({
    example: '06045362536',
  })
  @MaxLength(255)
  @IsOptional()
  phone: string;

  @ApiPropertyOptional({
    example: '06045362536',
  })
  @IsOptional()
  @MaxLength(255)
  phone2?: string;

  // COMPANY FIELDS
  @ApiPropertyOptional({
    example: 'pwC',
  })
  @IsRequiredForCompanies()
  @IsNotForIndividual()
  companyName?: string;

  @ApiPropertyOptional({
    example: '45362536',
  })
  @IsRequiredForCompanies()
  @IsNotForIndividual()
  rcNumber?: string;

  @ApiPropertyOptional({
    example: 'company@testmail.com',
  })
  @IsRequiredForCompanies()
  @IsNotForIndividual()
  companyEmail?: string;

  @ApiPropertyOptional({
    example: '06045362536',
  })
  @IsRequiredForCompanies()
  @IsNotForIndividual()
  companyPhone?: string;

  // COMPANY FIELDS END

  @ApiPropertyOptional({
    example: 'Access Bank Plc',
  })
  @IsOptional()
  @MaxLength(255)
  bankName?: string;

  @ApiPropertyOptional({
    example: 'Johnny Ufuoma',
  })
  @IsOptional()
  @MaxLength(255)
  accountName?: string;

  @ApiPropertyOptional({
    example: '948409362536',
  })
  @IsOptional()
  @MaxLength(255)
  accountNumber?: string;

  @ApiProperty({
    example: 'Nigeria',
  })
  @IsNotEmpty()
  @MaxLength(255)
  countryOfResidence: string;

  @ApiProperty({
    example: 'Rivers',
  })
  @IsNotEmpty()
  @MaxLength(255)
  state: string;

  referralCode?: string

  @ApiProperty({
    example: 'Port Harcourt',
  })
  @IsNotEmpty()
  @MaxLength(255)
  city: string;

  @ApiPropertyOptional({ type: [BulkCreateLicensingInfoDocumentSingleDto], description: 'Licensing Info' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkCreateLicensingInfoDocumentSingleDto)
  licensingInfo?: BulkCreateLicensingInfoDocumentSingleDto[];

  @ApiPropertyOptional({ type: BulkCreateAgentPocDto, description: 'Agent POC' })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => BulkCreateAgentPocDto)
  poc?: BulkCreateAgentPocDto;
}

export class UpdateAgentStatusDto {
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
  @IsOptional()
  comment?: string;

  @ApiProperty({ nullable: false, example: 1 })
  @IsNotEmpty()
  reviewerId: number;
}

@ArgsType()
export class UpdateAgentDto {
  @ApiProperty({ nullable: true, example: 1 })
  @Field(() => Int)
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  id: number;

  @ApiPropertyOptional({ example: AgentType.INDIVIDUAL })
  @Field(() => AgentType)
  @MaxLength(255)
  @IsOptional()
  agentType?: AgentType;

  @ApiPropertyOptional({
    example: 'Mr',
  })
  @MaxLength(255)
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({
    example: 'Johnny Ufuoma',
  })
  @MaxLength(255)
  @IsOptional()
  name: string;

  @ApiPropertyOptional({
    example: '06045362536',
  })
  @MaxLength(255)
  @IsOptional()
  phone: string;

  @ApiPropertyOptional({
    example: '06045362536',
  })
  @MaxLength(255)
  @IsOptional()
  phone2: string;

  @ApiPropertyOptional({
    example: 'pwC',
  })
  @MaxLength(255)
  @IsOptional()
  companyName: string;

  @ApiPropertyOptional({
    example: '45362536',
  })
  @MaxLength(255)
  @IsOptional()
  rcNumber: string;

  @ApiPropertyOptional({
    example: 'company@testmail.com',
  })
  @MaxLength(255)
  @IsOptional()
  companyEmail: string;

  @ApiPropertyOptional({
    example: '06045362536',
  })
  @MaxLength(255)
  @IsOptional()
  companyPhone: string;

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

  @ApiPropertyOptional({
    example: 'Nigeria',
  })
  @IsOptional()
  @MaxLength(255)
  countryOfResidence: string;

  @ApiPropertyOptional({
    example: 'Rivers',
  })
  @IsOptional()
  @MaxLength(255)
  state: string;

  @ApiPropertyOptional({
    example: 'Port Harcourt',
  })
  @IsOptional()
  @MaxLength(255)
  city: string;
}

@ObjectType()
export class PaginatedAgents {
  @Field(() => [Agent])
  data: Agent[];

  @Field(() => PaginationMeta)
  meta: PaginationMeta;
}

@ObjectType()
export class ReferreePaginationDto extends PaginationDto {
}

