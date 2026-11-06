import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { DeveloperOnboardingStageName, ModeOfBusinessRegistration } from './developer.enums';
import { IsArray, IsBoolean, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApprovalStatus } from '../common/common.enum';
import { Wallet } from '../wallet/wallet.entity';
import { Developer } from './developer.entity';
import { BulkCreateGroupEntityDto } from '../group-entity/group-entity.dto';
import { BulkCreateDeveloperPocDto } from '../developer-poc/developer-poc.dto';
import { BulkCreateDeveloperDirectorDto } from '../developer-director/developer-director.dto';
import { BulkCreateDeveloperDocumentDto } from '../developer-document/developer-document.dto';

const developerOnboardingStages: DeveloperOnboardingStage[] = [
  {
    name: DeveloperOnboardingStageName.BUSINESS_DETAILS,
    completed: false,
    completedAt: null,
    isCurrent: false
  },
  {
    name: DeveloperOnboardingStageName.GROUP_ENTITIES,
    completed: false,
    completedAt: null,
    isCurrent: false
  },
  {
    name: DeveloperOnboardingStageName.DEVELOPER_DOCUMENTS,
    completed: false,
    completedAt: null,
    isCurrent: false
  },
  {
    name: DeveloperOnboardingStageName.BANK_INFORMATION,
    completed: false,
    completedAt: null,
    isCurrent: false
  },
  {
    name: DeveloperOnboardingStageName.DIRECTORS_FORM,
    completed: false,
    completedAt: null,
    isCurrent: false
  },
  {
    name: DeveloperOnboardingStageName.TERMS_AND_CONDITION,
    completed: false,
    completedAt: null,
    isCurrent: false
  },
];

export class DeveloperOnboardingStage {
  @ApiProperty()
  name: DeveloperOnboardingStageName;

  @ApiProperty()
  completed: boolean;

  @ApiPropertyOptional()
  completedAt?: string;

  @ApiPropertyOptional()
  isCurrent: boolean;
}


export class UpdateDeveloperOnboardingStageDto {
  @ApiProperty({
    type: 'enum',
    enum: DeveloperOnboardingStageName,
    example: DeveloperOnboardingStageName.BUSINESS_DETAILS
  })
  stageName: DeveloperOnboardingStageName;

  @ApiProperty()
  completed: boolean;
}

export class BaseCreateDeveloperDto {
  @ApiPropertyOptional({
    nullable: true,
    maxLength: 255,
    type: 'string',
    example: 'Dangote Group'
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  businessName?: string;

  @ApiPropertyOptional({
    nullable: true,
    type: 'boolean',
    example: false
  })
  @IsOptional()
  @IsBoolean()
  isGovernmentAgency?: boolean;

  @ApiPropertyOptional({
    nullable: true,
    type: 'boolean',
    example: true
  })
  @IsOptional()
  @IsBoolean()
  hasTrackRecordInPropertyDevelopment?: boolean;

  @ApiPropertyOptional({
    nullable: true,
    type: 'boolean',
    example: true
  })
  @IsOptional()
  @IsBoolean()
  hasAuditedAccounts?: boolean;

  @ApiPropertyOptional({
    nullable: true,
    type: 'string',
    example: 'Software Engineer'
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  jobRole?: string;

  @ApiPropertyOptional({
    type: 'integer',
    nullable: true,
    example: 20
  })
  @IsOptional()
  @IsInt()
  yearsOfOperation?: number;

  @ApiPropertyOptional({
    nullable: true,
    type: 'enum',
    enum: ModeOfBusinessRegistration,
    example: ModeOfBusinessRegistration.LIMITED_LIABILITY,
  })
  @IsOptional()
  @IsEnum(ModeOfBusinessRegistration)
  modeOfRegistration?: ModeOfBusinessRegistration;

  @ApiPropertyOptional({
    nullable: true,
    type: 'string',
    example: '4839483'
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  tin?: string;

  @ApiPropertyOptional({
    nullable: true,
    type: 'string',
    example: '47384'
  })
  rcNumber?: string;

  @ApiPropertyOptional({
    nullable: true,
    example: '4304803043'
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  accountNumber?: string;

  @ApiPropertyOptional({
    nullable: true,
    type: 'string',
    example: 'Ufuoma Johnny'
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  accountName?: string;

  @ApiPropertyOptional({
    nullable: true,
    type: 'string',
    example: 'Zenith Bank Plc'
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  bank?: string;

  @ApiPropertyOptional({
    nullable: true,
    type: 'string',
    example: '34 Lucky London, Osubi, Delta'
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  registeredAddress?: string;

  @ApiPropertyOptional({
    nullable: true,
    type: 'string',
    example: '34 Lucky London, Osubi, Delta'
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  operatingAddress?: string;

  @ApiPropertyOptional({
    nullable: true,
    type: 'boolean',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isSubsidiary?: boolean;

  @ApiPropertyOptional({ nullable: true })
  agreedToTerms?: boolean;

  @ApiPropertyOptional({ nullable: true })
  logo?: string;

  @ApiPropertyOptional({
    nullable: true,
    type: [DeveloperOnboardingStage],
    example: developerOnboardingStages,
  })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => DeveloperOnboardingStage)
  onBoardingStages?: DeveloperOnboardingStage[];

  @ApiPropertyOptional({ type: [BulkCreateDeveloperPocDto], description: 'Array of developer POCs' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkCreateDeveloperPocDto)
  pocs?: BulkCreateDeveloperPocDto[];

  @ApiPropertyOptional({ type: [BulkCreateGroupEntityDto], description: 'Array of group entities' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkCreateGroupEntityDto)
  groupEntities?: BulkCreateGroupEntityDto[];

  @ApiPropertyOptional({ type: [BulkCreateDeveloperDirectorDto], description: 'Array of directors' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkCreateDeveloperDirectorDto)
  directors?: BulkCreateDeveloperDirectorDto[];

  @ApiPropertyOptional({ type: [BulkCreateDeveloperDocumentDto], description: 'Array of developer documents' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkCreateDeveloperDocumentDto)
  developerDocuments?: BulkCreateDeveloperDocumentDto[];
}

export class CreateDeveloperDto extends BaseCreateDeveloperDto {
  @ApiProperty({ nullable: true, example: 1 })
  @IsNotEmpty()
  @IsInt()
  userId: number;
}

export class LogoUploadDto {
  @ApiProperty({
    format: 'binary',
    description:
      'Image with max size of 10MB. The image will be resized before upload',
    example: 'example.jpg',
  })
  file: Express.Multer.File;
}

export class UpdateDeveloperDto extends PartialType(BaseCreateDeveloperDto) {

}

export class AvatarUploadDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'The file to be uploaded',
    example: 'example.pdf',
  })
  file: Express.Multer.File;
}


export class UpdateDeveloperStatusDto {
  @ApiProperty({
    nullable: false,
    enum: ApprovalStatus,
    example: ApprovalStatus.APPROVED,
  })
  @IsNotEmpty()
  @IsEnum(ApprovalStatus)
  status: ApprovalStatus;

  @ApiProperty({ nullable: false, example: 1 })
  @IsNotEmpty()
  reviewerId: number;

  @ApiPropertyOptional({ nullable: false })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  comment?: string;
}

export class DeveloperWithWallet extends Developer {
  wallet: Wallet;
}

export class FindByUserIdsDto {
  @ApiProperty({
    description: 'Array of user IDs to find associated developers',
    example: [1, 2, 3],
    type: [Number],
  })
  @IsArray()
  @IsInt({ each: true })
  @IsNotEmpty()
  userIds: number[];
}