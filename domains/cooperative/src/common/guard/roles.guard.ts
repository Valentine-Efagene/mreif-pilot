import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Roles } from '../decorator/roles.decorator';
import { UserRole } from '../../user/user.enums';
import { Observable } from 'rxjs';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const roles = this.reflector.get(Roles, context.getHandler());
    if (!roles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();

    const user = request.user;
    return this.matchRoles(roles, user.roles);
  }

  matchRoles(requiredRoles: UserRole[], userRoles: UserRole[]) {
    return userRoles.some((value) => requiredRoles.includes(value));
  }
}
