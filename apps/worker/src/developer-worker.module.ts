import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { buildTypeOrmOptions } from '../../../libs/database/src/typeorm-options';
import {
  DEVELOPER_CONNECTION,
  DEVELOPER_ENTITIES,
} from '../../../libs/database/src/domain-entities/developer.entities';
import { AsyncJobsModule } from '../../../libs/async-jobs/src';
import { Developer } from '../../../domains/developer/src/developer/developer.entity';
import { DeveloperDocument } from '../../../domains/developer/src/developer-document/developer-document.entity';
import { DeveloperDirectorDocument } from '../../../domains/developer/src/developer-director-document/developer-director-document.entity';
import { ProposedDevelopmentDocument } from '../../../domains/developer/src/proposed-development-document/proposed-development-document.entity';
import { S3UploaderModule } from '../../../domains/developer/src/s3-uploader/s3-uploader.module';
import { DeveloperAssetsPurgeHandler } from '../../../domains/developer/src/async/developer-assets-purge.handler';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forRootAsync({
      name: DEVELOPER_CONNECTION,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        buildTypeOrmOptions(config, DEVELOPER_CONNECTION, DEVELOPER_ENTITIES),
    }),
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
  providers: [DeveloperAssetsPurgeHandler],
  exports: [DeveloperAssetsPurgeHandler],
})
export class DeveloperWorkerModule {}
