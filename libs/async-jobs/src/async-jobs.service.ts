import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { AsyncJob } from './async-job.entity';
import type {
  AsyncJobStatusDto,
  CreateAsyncJobInput,
  AsyncJobStep,
} from './async-job.types';

@Injectable()
export class AsyncJobsService {
  constructor(private readonly repo: Repository<AsyncJob>) {}

  async findByIdempotencyKey(
    domain: string,
    idempotencyKey: string,
  ): Promise<AsyncJob | null> {
    return this.repo.findOne({ where: { domain, idempotencyKey } });
  }

  async createJob(input: CreateAsyncJobInput): Promise<AsyncJob> {
    if (input.idempotencyKey) {
      const existing = await this.findByIdempotencyKey(
        input.domain,
        input.idempotencyKey,
      );
      if (existing) {
        return existing;
      }
    }

    const steps: AsyncJobStep[] = input.steps.map((step) => ({
      ...step,
      status: 'pending',
    }));

    const job = this.repo.create({
      domain: input.domain,
      eventName: input.eventName,
      resourceType: input.resourceType,
      resourceId: input.resourceId,
      idempotencyKey: input.idempotencyKey,
      overallStatus: 'pending',
      progressPercent: 0,
      steps,
      payload: input.payload,
    });

    return this.repo.save(job);
  }

  async getJobOrThrow(jobId: string): Promise<AsyncJob> {
    const job = await this.repo.findOne({ where: { id: jobId } });
    if (!job) {
      throw new NotFoundException(`Async job ${jobId} not found`);
    }
    return job;
  }

  toStatusDto(job: AsyncJob): AsyncJobStatusDto {
    return {
      jobId: job.id,
      overallStatus: job.overallStatus,
      progressPercent: job.progressPercent,
      steps: job.steps,
      error: job.error ?? null,
      updatedAt: job.updatedAt.toISOString(),
    };
  }

  async markInProgress(jobId: string): Promise<void> {
    const job = await this.getJobOrThrow(jobId);
    job.overallStatus = 'in_progress';
    await this.repo.save(job);
  }

  async updateStep(
    jobId: string,
    stepId: string,
    status: AsyncJobStep['status'],
    detail?: string,
  ): Promise<void> {
    const job = await this.getJobOrThrow(jobId);
    job.steps = job.steps.map((step) =>
      step.id === stepId ? { ...step, status, detail } : step,
    );
    const completed = job.steps.filter((s) => s.status === 'completed').length;
    job.progressPercent = Math.round((completed / job.steps.length) * 100);
    job.overallStatus = 'in_progress';
    await this.repo.save(job);
  }

  async complete(jobId: string): Promise<void> {
    const job = await this.getJobOrThrow(jobId);
    job.steps = job.steps.map((step) => ({
      ...step,
      status: step.status === 'failed' ? step.status : 'completed',
    }));
    job.overallStatus = 'completed';
    job.progressPercent = 100;
    await this.repo.save(job);
  }

  async fail(jobId: string, error: string): Promise<void> {
    const job = await this.getJobOrThrow(jobId);
    job.overallStatus = 'failed';
    job.error = error;
    await this.repo.save(job);
  }
}
