import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Developer } from '../developer/developer.entity';
import { DeveloperDocument } from '../developer-document/developer-document.entity';
import { DeveloperDirectorDocument } from '../developer-director-document/developer-director-document.entity';
import { ProposedDevelopmentDocument } from '../proposed-development-document/proposed-development-document.entity';
import { S3UploaderService } from '../s3-uploader/s3-uploader.service';
import {
  AsyncJobsService,
  EVENT_DEVELOPER_ASSETS_PURGE,
  type DeveloperAssetsPurgePayload,
} from '../../../../libs/async-jobs/src';
import type { MessageEnvelope } from '../../../../libs/messaging/src/message-envelope';

type PurgeEnvelope = MessageEnvelope<
  DeveloperAssetsPurgePayload & { jobId: string }
>;

@Injectable()
export class DeveloperAssetsPurgeHandler {
  private readonly logger = new Logger(DeveloperAssetsPurgeHandler.name);

  constructor(
    @InjectRepository(Developer, 'developer')
    private readonly developerRepository: Repository<Developer>,
    @InjectRepository(DeveloperDocument, 'developer')
    private readonly developerDocumentRepository: Repository<DeveloperDocument>,
    @InjectRepository(DeveloperDirectorDocument, 'developer')
    private readonly directorDocumentRepository: Repository<DeveloperDirectorDocument>,
    @InjectRepository(ProposedDevelopmentDocument, 'developer')
    private readonly proposedDocumentRepository: Repository<ProposedDevelopmentDocument>,
    private readonly s3UploaderService: S3UploaderService,
    private readonly asyncJobs: AsyncJobsService,
  ) {}

  supports(eventName: string): boolean {
    return eventName === EVENT_DEVELOPER_ASSETS_PURGE;
  }

  async handle(envelope: PurgeEnvelope): Promise<void> {
    const { jobId, developerId } = envelope.payload;
    const developer = await this.developerRepository.findOne({
      where: { id: developerId },
    });
    if (!developer) {
      await this.asyncJobs.fail(jobId, `Developer ${developerId} not found`);
      throw new NotFoundException(`Developer ${developerId} not found`);
    }

    try {
      await this.asyncJobs.markInProgress(jobId);
      await this.asyncJobs.updateStep(jobId, 'collect', 'in_progress');

      const s3Keys = await this.collectS3Keys(developerId, developer.logo);
      await this.asyncJobs.updateStep(
        jobId,
        'collect',
        'completed',
        `Collected ${s3Keys.length} object key(s)`,
      );

      await this.asyncJobs.updateStep(jobId, 'database', 'in_progress');
      await this.developerRepository.delete(developerId);
      await this.asyncJobs.updateStep(jobId, 'database', 'completed');

      await this.asyncJobs.updateStep(jobId, 's3', 'in_progress');
      for (const key of s3Keys) {
        if (key) {
          try {
            await this.s3UploaderService.deleteFromS3(key);
          } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            this.logger.warn(`S3 delete failed for ${key}: ${message}`);
          }
        }
      }
      await this.asyncJobs.updateStep(
        jobId,
        's3',
        'completed',
        `Deleted ${s3Keys.length} object(s)`,
      );

      await this.asyncJobs.updateStep(jobId, 'finalize', 'in_progress');
      await this.asyncJobs.updateStep(jobId, 'finalize', 'completed');
      await this.asyncJobs.complete(jobId);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      await this.asyncJobs.fail(jobId, message);
      throw err;
    }
  }

  private async collectS3Keys(
    developerId: number,
    logo?: string,
  ): Promise<string[]> {
    const keys: string[] = [];
    if (logo) {
      keys.push(logo);
    }

    const developerDocs = await this.developerDocumentRepository.find({
      where: { developer: { id: developerId } },
      relations: ['developer'],
    });
    developerDocs.forEach((doc) => doc.url && keys.push(doc.url));

    const directorDocs = await this.directorDocumentRepository
      .createQueryBuilder('doc')
      .innerJoin('doc.developerDirector', 'director')
      .where('director.developer_id = :developerId', { developerId })
      .getMany();
    directorDocs.forEach((doc) => doc.url && keys.push(doc.url));

    const proposedDocs = await this.proposedDocumentRepository
      .createQueryBuilder('doc')
      .innerJoin('doc.proposedDevelopment', 'pd')
      .where('pd.developer_id = :developerId', { developerId })
      .getMany();
    proposedDocs.forEach((doc) => doc.url && keys.push(doc.url));

    return [...new Set(keys)];
  }
}
