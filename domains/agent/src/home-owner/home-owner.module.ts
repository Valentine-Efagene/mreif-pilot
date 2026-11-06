import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HomeOwner } from './home-owner.entity';
import { HomeOwnerService } from './home-owner.service';
import { HomeOwnerController } from './home-owner.controller';
import { UserModule } from '../user/user.module';
import { HomeOwnerDocumentModule } from '../home-owner-document/home-owner-document.module';
import { HomeOwnerPocModule } from '../home-owner-poc/home-owner-poc.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([HomeOwner], 'agent'),
    UserModule,
    HomeOwnerDocumentModule,
    HomeOwnerPocModule,
    NotificationModule
  ],
  providers: [HomeOwnerService],
  controllers: [HomeOwnerController],
})
export class HomeOwnerModule { }
