import { Module } from '@nestjs/common';
import { DEVELOPER_CONNECTION } from '../../../../libs/database/src/domain-entities/developer.entities';
import { AsyncJobsModule, createAsyncJobsController } from '../../../../libs/async-jobs/src';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Developer } from './developer.entity';
import { DeveloperController } from './developer.controller';
import { DeveloperService } from './developer.service';
import { DeveloperRepository } from './developer.repository';
import { S3UploaderModule } from '../s3-uploader/s3-uploader.module';
import { ProposedDevelopment } from '../proposed-development/proposed-development.entity';
import { NotificationModule } from '../notification/notification.module';
import { Wallet } from '../wallet/wallet.entity';
import { UserModule } from '../user/user.module';
import { User } from '../user/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Developer, ProposedDevelopment, Wallet, User], 'developer'),
    AsyncJobsModule.forRoot({ connectionName: DEVELOPER_CONNECTION }),
    S3UploaderModule,
    NotificationModule,
    UserModule,
  ],
  providers: [DeveloperService, DeveloperRepository],
  controllers: [
    DeveloperController,
    createAsyncJobsController('developer', 'Developer async jobs'),
  ],
  exports: [DeveloperService],
})
export class DeveloperModule { }
