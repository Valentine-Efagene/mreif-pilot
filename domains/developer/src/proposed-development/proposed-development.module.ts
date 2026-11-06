import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProposedDevelopment } from './proposed-development.entity';
import { ProposedDevelopmentController } from './proposed-development.controller';
import { ProposedDevelopmentService } from './proposed-development.service';
import { ProposedDevelopmentRepository } from './proposed-development.repository';
import { DeveloperModule } from '../developer/developer.module';
import { ProposedPropertyModule } from '../proposed-property/proposed-property.module';
import { NotificationModule } from '../notification/notification.module';
import { UserModule } from '../user/user.module';
import { ProposedDevelopmentDocument } from '../proposed-development-document/proposed-development-document.entity';
import { S3UploaderModule } from '../s3-uploader/s3-uploader.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProposedDevelopment, ProposedDevelopmentDocument], 'developer'),
    DeveloperModule,
    ProposedPropertyModule,
    NotificationModule,
    UserModule,
    S3UploaderModule,
  ],
  providers: [ProposedDevelopmentService, ProposedDevelopmentRepository],
  controllers: [ProposedDevelopmentController],
  exports: [ProposedDevelopmentService],
})
export class ProposedDevelopmentModule { }
