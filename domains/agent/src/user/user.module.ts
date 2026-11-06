import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserService } from './user.service';
import UserResolver from './user.resolver';
import { UserController } from './user.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User], 'agent')],
  providers: [UserService, UserResolver],
  controllers: [UserController],
  exports: [UserService]
})
export class UserModule { }
