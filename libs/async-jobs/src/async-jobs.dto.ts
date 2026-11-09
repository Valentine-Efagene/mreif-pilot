import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { AsyncJobOverallStatus, AsyncJobStep } from './async-job.types';

export class AsyncJobAcceptedDto {
  @ApiProperty()
  jobId: string;

  @ApiProperty()
  statusUrl: string;
}

export class AsyncJobStatusResponseDto {
  @ApiProperty()
  jobId: string;

  @ApiProperty()
  overallStatus: AsyncJobOverallStatus;

  @ApiProperty()
  progressPercent: number;

  @ApiProperty({ type: 'array' })
  steps: AsyncJobStep[];

  @ApiPropertyOptional({ nullable: true })
  error: string | null;

  @ApiProperty()
  updatedAt: string;
}
