export type AsyncJobStepStatus =
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'failed';

export type AsyncJobOverallStatus =
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'failed';

export type AsyncJobStep = {
  id: string;
  label: string;
  status: AsyncJobStepStatus;
  detail?: string;
};

export type AsyncJobStatusDto = {
  jobId: string;
  overallStatus: AsyncJobOverallStatus;
  progressPercent: number;
  steps: AsyncJobStep[];
  error: string | null;
  updatedAt: string;
};

export type CreateAsyncJobInput = {
  domain: string;
  eventName: string;
  resourceType?: string;
  resourceId?: string;
  idempotencyKey?: string;
  steps: Array<{ id: string; label: string }>;
  payload?: Record<string, unknown>;
};

export type DeveloperAssetsPurgePayload = {
  developerId: number;
};
