import {
  BadRequestException,
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { UserService } from '../../user/user.service';

@Injectable()
export default class AuthenticationMiddleware implements NestMiddleware {
  constructor(private readonly userService: UserService) { }

  async use(req: Request, res: Response, next: NextFunction) {
    const userId = req.headers['user_id'];

    if (!userId) {
      throw new BadRequestException('Invalid user ID');
    }

    if (isNaN(Number(userId))) {
      throw new BadRequestException('Invalid user ID');
    }

    const user = await this.userService.findOne(Number(userId));

    if (!user) {
      throw new UnauthorizedException();
    }

    req['user'] = user;

    next();
  }
}
