import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { buildTypeOrmOptions } from '../../../libs/database/src/typeorm-options';
import {
  COOPERATIVE_CONNECTION,
  COOPERATIVE_ENTITIES,
} from '../../../libs/database/src/domain-entities/cooperative.entities';
import { UserModule } from './user/user.module';
import { User } from './user/user.entity';
import { S3UploaderModule } from './s3-uploader/s3-uploader.module';
import { CommonModule } from './common/common.module';
import { CooperativeModule } from './cooperative/cooperative.module';
import { NotificationModule } from './notification/notification.module';
import { StatsModule } from './stats/stats.module';
import { AuthModule } from './auth/auth.module';
import { AccessLoggerMiddleware } from './common/middleware/AccessLoggerMiddleware';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      name: COOPERATIVE_CONNECTION,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        buildTypeOrmOptions(config, COOPERATIVE_CONNECTION, COOPERATIVE_ENTITIES),
    }),
    TypeOrmModule.forFeature([User], 'cooperative'),
    UserModule,
    CooperativeModule,
    StatsModule,
    S3UploaderModule,
    NotificationModule,
    CommonModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class CooperativeDomainModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AccessLoggerMiddleware).forRoutes('*');
  }
}
