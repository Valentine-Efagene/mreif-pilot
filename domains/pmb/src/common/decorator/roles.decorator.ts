import { Reflector } from '@nestjs/core';
import { UserRole } from '../../user/user.enums';

export const Roles = Reflector.createDecorator<UserRole[]>();
