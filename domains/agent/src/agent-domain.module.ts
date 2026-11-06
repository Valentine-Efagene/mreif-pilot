import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { buildTypeOrmOptions } from '../../../libs/database/src/typeorm-options';
import { AGENT_CONNECTION, AGENT_ENTITIES } from '../../../libs/database/src/domain-entities/agent.entities';
import { UserModule } from './user/user.module';
import { AgentModule } from './agent/agent.module';
import { LicensingDocumentModule } from './licensing-document/licensing-document.module';
import { LicensingInfoModule } from './licensing-info/licensing-info.module';
import { ReferralModule } from './referral/referral.module';
import { CommissionModule } from './commission/commission.module';
import { HomeOwnerModule } from './home-owner/home-owner.module';
import { HomeOwnerDocumentModule } from './home-owner-document/home-owner-document.module';
import { HomeOwnerPocModule } from './home-owner-poc/home-owner-poc.module';
import { NotificationModule } from './notification/notification.module';
import { AgentPocModule } from './agent-poc/agent-poc.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AccessLoggerMiddleware } from './common/middleware/AccessLoggerMiddleware';
import { HealthController } from './health/health.controller';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        buildTypeOrmOptions(config, AGENT_CONNECTION, AGENT_ENTITIES),
    }),
    UserModule,
    AgentModule,
    LicensingDocumentModule,
    LicensingInfoModule,
    ReferralModule,
    CommissionModule,
    HomeOwnerModule,
    HomeOwnerDocumentModule,
    HomeOwnerPocModule,
    NotificationModule,
    AgentPocModule,
  ],
  controllers: [AppController, HealthController],
  providers: [AppService],
})
export class AgentDomainModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AccessLoggerMiddleware).forRoutes('*');
  }
}
