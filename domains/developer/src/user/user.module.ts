import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [TypeOrmModule.forFeature([User], 'developer')],
  providers: [UserService],
  exports: [UserService],
  controllers: [UserController],
})
export class UserModule { }
