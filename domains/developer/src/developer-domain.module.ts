import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { buildTypeOrmOptions } from '../../../libs/database/src/typeorm-options';
import {
  DEVELOPER_CONNECTION,
  DEVELOPER_ENTITIES,
} from '../../../libs/database/src/domain-entities/developer.entities';
import { UserModule } from './user/user.module';
import { User } from './user/user.entity';
import { DeveloperModule } from './developer/developer.module';
import { ProposedDevelopmentModule } from './proposed-development/proposed-development.module';
import { DeveloperPocModule } from './developer-poc/developer-poc.module';
import { DeveloperDirectorModule } from './developer-director/developer-director.module';
import { DeveloperDocumentModule } from './developer-document/developer-document.module';
import { DeveloperDirectorDocumentModule } from './developer-director-document/developer-director-document.module';
import { ProposedPropertyModule } from './proposed-property/proposed-property.module';
import { ProposedDevelopmentDocumentModule } from './proposed-development-document/proposed-development-document.module';
import { GroupEntityModule } from './group-entity/group-entity.module';
import { S3UploaderModule } from './s3-uploader/s3-uploader.module';
import { VerifierModule } from './verifier/verifier.module';
import { CommonModule } from './common/common.module';
import { PropertyModule } from './property/property.module';
import { NotificationModule } from './notification/notification.module';
import { AuthModule } from '@qshelter/nest-auth';
import { HttpModule } from '@nestjs/axios';
import { AccessLoggerMiddleware } from './common/middleware/AccessLoggerMiddleware';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        buildTypeOrmOptions(config, DEVELOPER_CONNECTION, DEVELOPER_ENTITIES),
    }),
    TypeOrmModule.forFeature([User], 'developer'),
    UserModule,
    DeveloperModule,
    ProposedDevelopmentModule,
    DeveloperPocModule,
    DeveloperDirectorModule,
    DeveloperDocumentModule,
    DeveloperDirectorDocumentModule,
    ProposedPropertyModule,
    PropertyModule,
    S3UploaderModule,
    NotificationModule,
    HttpModule,
    ProposedDevelopmentDocumentModule,
    GroupEntityModule,
    VerifierModule,
    CommonModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class DeveloperDomainModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AccessLoggerMiddleware).forRoutes('*');
  }
}
