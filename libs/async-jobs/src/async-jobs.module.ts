import { DynamicModule, Module } from '@nestjs/common';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MofiMessagingModule } from '../../messaging/src/messaging.module';
import { AsyncJob } from './async-job.entity';
import { AsyncJobsService } from './async-jobs.service';
import { AsyncJobsPublisher } from './async-jobs-publisher.service';

export type AsyncJobsModuleOptions = {
  connectionName: string;
};

@Module({})
export class AsyncJobsModule {
  static forRoot(options: AsyncJobsModuleOptions): DynamicModule {
    return {
      module: AsyncJobsModule,
      imports: [
        MofiMessagingModule,
        TypeOrmModule.forFeature([AsyncJob], options.connectionName),
      ],
      providers: [
        {
          provide: AsyncJobsService,
          useFactory: (repo: Repository<AsyncJob>) => new AsyncJobsService(repo),
          inject: [getRepositoryToken(AsyncJob, options.connectionName)],
        },
        AsyncJobsPublisher,
      ],
      exports: [AsyncJobsService, AsyncJobsPublisher],
    };
  }
}
