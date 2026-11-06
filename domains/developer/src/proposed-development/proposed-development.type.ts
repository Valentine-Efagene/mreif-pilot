import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProposedDevelopment } from './proposed-development.entity';
import { OnboardingStageName } from './proposed-development.enums';

export interface ICreateProposedDevelopmentDto
  extends Partial<Omit<ProposedDevelopment, 'id'>> { }

export type IUpdateProposedDevelopmentDto = ICreateProposedDevelopmentDto;

export interface IStatesProjects {
  state: string;
  project: ProposedDevelopment | null
}

export class OnboardingStage {
  @ApiProperty()
  name: OnboardingStageName;

  @ApiProperty()
  completed: boolean;

  @ApiPropertyOptional()
  completedAt?: string;

  @ApiPropertyOptional()
  isCurrent?: boolean;
}

export class ProjectWithPropertyTypes extends ProposedDevelopment {
  propertyTypes: Array<string>
}