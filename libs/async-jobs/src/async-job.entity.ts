import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { AsyncJobOverallStatus, AsyncJobStep } from './async-job.types';

@Entity({ name: 'async_jobs' })
@Index(['domain', 'idempotencyKey'], { unique: true })
export class AsyncJob {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 32 })
  domain: string;

  @Column({ name: 'event_name', length: 128 })
  eventName: string;

  @Column({ name: 'resource_type', length: 64, nullable: true })
  resourceType?: string;

  @Column({ name: 'resource_id', length: 64, nullable: true })
  resourceId?: string;

  @Column({ name: 'idempotency_key', length: 128, nullable: true })
  idempotencyKey?: string;

  @Column({ name: 'overall_status', length: 32 })
  overallStatus: AsyncJobOverallStatus;

  @Column({ name: 'progress_percent', type: 'int', default: 0 })
  progressPercent: number;

  @Column({ type: 'json' })
  steps: AsyncJobStep[];

  @Column({ type: 'text', nullable: true })
  error?: string;

  @Column({ type: 'json', nullable: true })
  payload?: Record<string, unknown>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
