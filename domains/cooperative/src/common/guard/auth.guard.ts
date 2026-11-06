import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private reflector: Reflector) { }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // const roles = this.reflector.get(Roles, context.getHandler());
    // if (!roles) {
    //   return true;
    // }

    const request = context.switchToHttp().getRequest();
    const userId = request.headers['user_id'];
    console.log(request.headers?.authorization?.split(' ')?.[1])

    return userId != null
  }
}
