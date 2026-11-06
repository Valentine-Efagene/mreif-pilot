import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Agent } from './agent.entity';
import { AgentService } from './agent.service';
import { AgentController } from './agent.controller';
import { CommissionModule } from '../commission/commission.module';
import { UserModule } from '../user/user.module';
import { LicensingDocumentModule } from '../licensing-document/licensing-document.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [TypeOrmModule.forFeature([Agent], 'agent'), CommissionModule, UserModule, LicensingDocumentModule, NotificationModule],
  providers: [AgentService],
  controllers: [AgentController],
})
export class AgentModule { }
