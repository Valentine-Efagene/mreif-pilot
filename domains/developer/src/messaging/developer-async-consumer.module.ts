import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DEVELOPER_CONNECTION } from '../../../../libs/database/src/domain-entities/developer.entities';
import { AsyncJobsModule } from '../../../../libs/async-jobs/src';
import { Developer } from '../developer/developer.entity';
import { DeveloperDocument } from '../developer-document/developer-document.entity';
import { DeveloperDirectorDocument } from '../developer-director-document/developer-director-document.entity';
import { ProposedDevelopmentDocument } from '../proposed-development-document/proposed-development-document.entity';
import { S3UploaderModule } from '../s3-uploader/s3-uploader.module';
import { DeveloperAssetsPurgeHandler } from '../async/developer-assets-purge.handler';
import { DeveloperCommandsController } from './developer-commands.controller';

/**
 * RabbitMQ consumers for developer domain commands (Nest microservice handlers).
 * Wired when the developer container connects via `connectMofiMicroservices`.
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
  ],
  controllers: [DeveloperCommandsController],
  providers: [DeveloperAssetsPurgeHandler],
})
export class DeveloperAsyncConsumerModule {}
