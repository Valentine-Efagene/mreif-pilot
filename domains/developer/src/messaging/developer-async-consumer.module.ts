import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DEVELOPER_CONNECTION } from '../../../../libs/database/src/domain-entities/developer.entities';
import { AsyncJobsModule } from '../../../../libs/async-jobs/src';
import { domainCommandsQueueName } from '../../../../libs/messaging/src/domain-commands';
import { Developer } from '../developer/developer.entity';
import { DeveloperDocument } from '../developer-document/developer-document.entity';
import { DeveloperDirectorDocument } from '../developer-director-document/developer-director-document.entity';
import { ProposedDevelopmentDocument } from '../proposed-development-document/proposed-development-document.entity';
import { S3UploaderModule } from '../s3-uploader/s3-uploader.module';
import { DeveloperAssetsPurgeHandler } from '../async/developer-assets-purge.handler';
import { DeveloperCommandsProcessor } from './developer-commands.processor';

/**
 * BullMQ consumers for developer domain commands.
 * Runs only in the developer container.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature(
      [
        Developer,
        DeveloperDocument,
        DeveloperDirectorDocument,
        ProposedDevelopmentDocument,
      ],
      DEVELOPER_CONNECTION,
    ),
    AsyncJobsModule.forRoot({ connectionName: DEVELOPER_CONNECTION }),
    S3UploaderModule,
    BullModule.registerQueue({ name: domainCommandsQueueName('developer') }),
  ],
  providers: [DeveloperAssetsPurgeHandler, DeveloperCommandsProcessor],
})
export class DeveloperAsyncConsumerModule {}
