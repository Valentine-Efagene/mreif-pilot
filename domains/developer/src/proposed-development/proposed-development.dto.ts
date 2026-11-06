import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Category,
  OnboardingStageName,
  PresellCommitmentEvidence,
  ProjectType,
  ProposedDevelopmentApprovalStatus,
} from './proposed-development.enums';
import { IsArray, IsBoolean, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';
import { OnboardingStage } from './proposed-development.type';
import { Transform, Type } from 'class-transformer';
import { CreateProposedPropertyNoRelDto } from '../proposed-property/proposed-property.dto';

const exampleOnboardingStages: OnboardingStage[] = [
  {
    name: OnboardingStageName.PRELIMINARY_EVALUATION,
    completed: true,
    completedAt: new Date().toISOString(),
    isCurrent: false
  },
  {
    name: OnboardingStageName.PROJECT_INFO_DOCUMENTS,
    completed: false,
    completedAt: null,
    isCurrent: false
  },
  {
    name: OnboardingStageName.TECHNICAL_DOCUMENTATION,
    completed: false,
    completedAt: null,
    isCurrent: false
  },
  {
    name: OnboardingStageName.SALES_STRATEGY,
    completed: false,
    completedAt: null,
    isCurrent: false
  },
  {
    name: OnboardingStageName.PROJECT_VIABILITY,
    completed: false,
    completedAt: null,
    isCurrent: false
  },
];

export class UpdateOnboardingStageDto {
  @ApiProperty({
    type: 'enum',
    enum: OnboardingStageName,
    example: OnboardingStageName.PRELIMINARY_EVALUATION
  })
  stageName: OnboardingStageName;

  @ApiProperty()
  completed: boolean;
}

export class UpdateProposedDevelopmentStatusDto {
  @ApiProperty({
    nullable: false,
    enum: ProposedDevelopmentApprovalStatus,
    example: Object.values(ProposedDevelopmentApprovalStatus).join(', '),
  })
  @IsNotEmpty()
  @IsEnum(ProposedDevelopmentApprovalStatus)
  status: ProposedDevelopmentApprovalStatus;

  @ApiProperty({ nullable: false, example: 1 })
  @IsNotEmpty()
  reviewerId: number;

  @ApiPropertyOptional({ nullable: false })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  declineReason?: string;
}

export class ProposedDevelopmentQueryDto {
  @ApiPropertyOptional({ nullable: false })
  @IsOptional()
  @IsString()
  hideIncomplete?: string;

  @ApiPropertyOptional({ nullable: false })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({ nullable: false })
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiPropertyOptional({ nullable: false })
  @IsOptional()
  @Transform(({ value }) => {
    return value ? parseInt(value, 10) : undefined;
  })
  @IsInt()
  developerId?: number;

  @ApiPropertyOptional({
    nullable: false,
    example: 'Lagos',
    description: 'Filter by state name'
  })
  @IsOptional()
  @IsString()
  state?: string;
}

export class DeclineProposedDevelopmentDto {
  @ApiPropertyOptional({ nullable: false })
  @IsOptional()
  @IsString()
  declineReason?: string;

  // @ApiPropertyOptional({ nullable: false })
  // @IsOptional()
  // affectedDocuments?: string;

  @ApiProperty({ nullable: false, example: 1 })
  @IsNotEmpty()
  reviewerId: number;
}

export class UpdateProposedDevelopmentDto {
  @ApiPropertyOptional({
    nullable: true,
    example: '34 Lucky London, Osubi, Delta'
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  proposedLocation?: string;

  @ApiPropertyOptional({
    nullable: true,
    example: 'Delta'
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  state?: string;

  @ApiPropertyOptional({
    nullable: true,
    example: 'Warri'
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  city?: string;

  @ApiPropertyOptional({
    nullable: true,
    example: true
  })
  @IsOptional()
  @IsBoolean()
  locationIsMarketable?: boolean;

  @ApiPropertyOptional({
    nullable: true,
    example: true
  })
  @IsOptional()
  @IsBoolean()
  hasAuditedAccounts?: boolean;

  @ApiPropertyOptional({
    nullable: true,
    example: 50000000
  })
  @IsOptional()
  @IsNumber()
  gdv?: number;

  @ApiPropertyOptional({
    nullable: true,
    example: true
  })
  @IsOptional()
  @IsBoolean()
  landHasCoc?: boolean;

  @ApiPropertyOptional({
    nullable: true,
    example: true
  })
  @IsOptional()
  @IsBoolean()
  developerHasAnotherTitleAtLocation?: boolean;

  @ApiPropertyOptional({
    nullable: true,
    example: 'Registered 05-04-2010'
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  registryInfo?: string;

  @ApiPropertyOptional({
    nullable: true,
    example: 60000000
  })
  @IsOptional()
  @IsNumber()
  totalDevelopmentCost?: number;

  @ApiPropertyOptional({
    nullable: true,
    example: true
  })
  @IsOptional()
  @IsBoolean()
  developerCanProvideEquity?: boolean;

  @ApiPropertyOptional({
    nullable: true,
    example: true
  })
  @IsOptional()
  @IsBoolean()
  equityIsAvailableNow?: boolean;

  @ApiPropertyOptional({
    nullable: true,
    example: 'Access Bank Plc'
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  targetOfftakers?: string;

  @ApiPropertyOptional({
    nullable: true,
    example: true
  })
  @IsOptional()
  @IsBoolean()
  targetOfftakersProfiled?: boolean;

  @ApiPropertyOptional({
    nullable: true,
    example: 300
  })
  @IsOptional()
  @IsInt()
  nUnitsPresoldOrCommited?: number;

  @ApiPropertyOptional({
    nullable: true,
    type: 'enum',
    enum: PresellCommitmentEvidence,
    example: PresellCommitmentEvidence.BINDING_PRESALE_AGREEMENT
  })
  @IsOptional()
  @IsEnum(PresellCommitmentEvidence)
  presellCommitmentEvidence?: PresellCommitmentEvidence;

  @ApiPropertyOptional({
    nullable: true,
    example: true
  })
  @IsOptional()
  @IsBoolean()
  designAndCostAvailable?: boolean;

  @ApiPropertyOptional({
    nullable: true,
    example: true
  })
  @IsOptional()
  @IsBoolean()
  drawingsAreByRegisteredConsultants?: boolean;

  @ApiPropertyOptional({
    nullable: true,
    example: true
  })
  @IsBoolean()
  @IsOptional()
  isCompleted?: boolean;

  @ApiPropertyOptional({
    nullable: true,
    example: 'Dangote Group'
  })
  @IsOptional()
  @IsString()
  nameOnCOfO?: string;

  @ApiPropertyOptional({
    nullable: true,
    example: 'Big multinational bank'
  })
  @IsString()
  @IsOptional()
  targetOfftakersProfileInfo?: string;

  @ApiPropertyOptional({
    nullable: true,
    type: 'enum',
    enum: ProjectType,
    example: ProjectType.COMPLETED
  })
  @IsOptional()
  @IsEnum(ProjectType)
  type?: ProjectType;

  @ApiPropertyOptional({
    nullable: true,
    type: 'enum',
    enum: Category,
    example: Category.A
  })
  @IsOptional()
  @IsEnum(Category)
  category?: Category;

  @ApiPropertyOptional({
    nullable: true,
    type: [OnboardingStage],
    example: exampleOnboardingStages,
  })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => OnboardingStage)
  onBoardingStages?: OnboardingStage[];

  @ApiPropertyOptional({
    type: [CreateProposedPropertyNoRelDto],
    example: [
      {
        type: 'Bungalow',
        nUnits: 5,
        nBeds: 3,
        targetPrice: 50000000,
      },
      {
        type: 'Bungalow',
        nUnits: 5,
        nBeds: 3,
        targetPrice: 50000000,
      },
      {
        type: 'Bungalow',
        nUnits: 5,
        nBeds: 3,
        targetPrice: 50000000,
      },
      {
        type: 'Bungalow',
        nUnits: 5,
        nBeds: 3,
        targetPrice: 50000000,
      },
    ],
    description: 'Array of group entities to create',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProposedPropertyNoRelDto)
  proposedProperties?: CreateProposedPropertyNoRelDto[];
}

export class CreateProposedDevelopmentDto extends UpdateProposedDevelopmentDto {
  @ApiProperty({ nullable: false, example: 1 })
  @IsNotEmpty()
  developerId: number;

  @ApiPropertyOptional({
    nullable: false,
  })
  @IsNotEmpty()
  @IsEnum(ProjectType)
  type?: ProjectType;
}