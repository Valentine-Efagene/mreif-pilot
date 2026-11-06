import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { S3UploaderModule } from './s3-uploader/s3-uploader.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AccessLoggerMiddleware } from './common/middleware/AccessLoggerMiddleware';

@Module({
  imports: [S3UploaderModule],
  controllers: [AppController],
  providers: [AppService],
})
export class UploaderDomainModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AccessLoggerMiddleware).forRoutes('*');
  }
}
