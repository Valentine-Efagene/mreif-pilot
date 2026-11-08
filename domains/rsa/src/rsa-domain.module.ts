import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { buildTypeOrmOptions } from '../../../libs/database/src/typeorm-options';
import { RSA_CONNECTION, RSA_ENTITIES } from '../../../libs/database/src/domain-entities/rsa.entities';
import { UserModule } from './user/user.module';
import { User } from './user/user.entity';
import { CommonModule } from './common/common.module';
import { RsaModule } from './rsa/rsa.module';
import { NotificationModule } from './notification/notification.module';
import { StatsModule } from './stats/stats.module';
import { RsaDocumentModule } from './rsa-document/rsa-document.module';
import { MortgageModule } from './mortgage/mortgage.module';
import { AccessLoggerMiddleware } from './common/middleware/AccessLoggerMiddleware';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RsaLegacyApiController } from './rsa/rsa-legacy-api.controller';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      name: RSA_CONNECTION,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        buildTypeOrmOptions(config, RSA_CONNECTION, RSA_ENTITIES),
    }),
    TypeOrmModule.forFeature([User], 'rsa'),
    UserModule,
    RsaModule,
    RsaDocumentModule,
    MortgageModule,
    StatsModule,
    NotificationModule,
    CommonModule,
  ],
  controllers: [AppController, RsaLegacyApiController],
  providers: [AppService],
})
export class RsaDomainModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AccessLoggerMiddleware).forRoutes('*');
  }
}
