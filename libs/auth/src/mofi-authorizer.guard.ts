import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { jwtDecode } from 'jwt-decode';
import { IS_PUBLIC_KEY } from './public.decorator';
import { isAuthorizerPublicPath } from './authorizer-public-routes';

interface AuthorizerJwtPayload {
  user_id?: number;
  roles?: string[];
  sub?: string;
}

@Injectable()
export class MofiAuthorizerGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const method = request.method?.toUpperCase();
    const path: string = request.path ?? request.url ?? '';

    if (method === 'OPTIONS') {
      return true;
    }
    if (path.includes('/docs') || path.endsWith('/favicon.ico')) {
      return true;
    }
    if (this.isPublicPath(path)) {
      return true;
    }

    const authHeader: string | undefined = request.headers['authorization'];
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid Authorization header');
    }

    const token = authHeader.slice('Bearer '.length).trim();
    let decoded: AuthorizerJwtPayload;
    try {
      decoded = jwtDecode<AuthorizerJwtPayload>(token);
    } catch {
      throw new UnauthorizedException('Invalid token');
    }

    const headerUserId = request.headers['user_id'];
    const jwtUserId = decoded.user_id ?? (decoded.sub ? Number(decoded.sub) : undefined);

    if (headerUserId !== undefined && jwtUserId !== undefined) {
      if (String(headerUserId) !== String(jwtUserId)) {
        throw new UnauthorizedException('user_id header does not match token');
      }
    }

    request.user = {
      id: jwtUserId ?? headerUserId,
      roles: decoded.roles ?? [],
      ...decoded,
    };

    return true;
  }

  private isPublicPath(path: string): boolean {
    return isAuthorizerPublicPath(path);
  }
}
