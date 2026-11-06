
import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto } from './auth.dto';
import { ApiTags } from '@nestjs/swagger';
import { StandardApiResponse } from '../common/common.dto';
import { HttpStatusCode } from 'axios';
import { ResponseMessage } from '../common/common.enum';
import { Public } from '../../../../libs/auth/src/public.decorator';

@ApiTags('Authorization')
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Public()
    @HttpCode(HttpStatus.OK)
    @Post('login')
    async signIn(@Body() signInDto: SignInDto): Promise<StandardApiResponse<string>> {
        const token = await this.authService.authorize(signInDto.identifier, signInDto.password);
        return new StandardApiResponse(HttpStatusCode.Ok, ResponseMessage.AUTHENTICATED, token)
    }
}
