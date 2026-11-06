import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { buildTypeOrmOptions } from '../../../libs/database/src/typeorm-options';
import { PMB_CONNECTION, PMB_ENTITIES } from '../../../libs/database/src/domain-entities/pmb.entities';
import { UserModule } from './user/user.module';
import { User } from './user/user.entity';
import { UserService } from './user/user.service';
import { UserRepository } from './user/user.repository';
import { S3UploaderModule } from './s3-uploader/s3-uploader.module';
import { CommonModule } from './common/common.module';
import { PmbModule } from './pmb/pmb.module';
import { NotificationModule } from './notification/notification.module';
import { StatsModule } from './stats/stats.module';
import { MortgageModule } from './mortgage/mortgage.module';
import { MortgageApplicantModule } from './mortgage-applicant/mortgage-applicant.module';
import { AccessLoggerMiddleware } from './common/middleware/AccessLoggerMiddleware';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        buildTypeOrmOptions(config, PMB_CONNECTION, PMB_ENTITIES),
    }),
    TypeOrmModule.forFeature([User], 'pmb'),
    UserModule,
    PmbModule,
    StatsModule,
    MortgageModule,
    S3UploaderModule,
    NotificationModule,
    CommonModule,
    MortgageApplicantModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    UserService,
    UserRepository,
  ],
})
export class PmbDomainModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AccessLoggerMiddleware).forRoutes('*');
  }
}
