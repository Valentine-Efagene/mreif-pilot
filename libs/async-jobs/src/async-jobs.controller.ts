import {
  BadRequestException,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Type,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../auth/src/public.decorator';
import { AsyncJobsService } from './async-jobs.service';
import { AsyncJobStatusResponseDto } from './async-jobs.dto';

export function createAsyncJobsController(
  domain: string,
  tag: string,
): Type<unknown> {
  @ApiTags(tag)
  @Controller('async-jobs')
  class AsyncJobsHttpController {
    constructor(private readonly asyncJobs: AsyncJobsService) {}

    @Public()
    @Get(':jobId')
    @ApiOperation({ summary: 'Poll long-running operation status' })
    async getStatus(
      @Param('jobId', ParseUUIDPipe) jobId: string,
    ): Promise<AsyncJobStatusResponseDto> {
      const job = await this.asyncJobs.getJobOrThrow(jobId);
      if (job.domain !== domain) {
        throw new BadRequestException(`Job does not belong to domain ${domain}`);
      }
      return this.asyncJobs.toStatusDto(job);
    }
  }

  return AsyncJobsHttpController;
}
