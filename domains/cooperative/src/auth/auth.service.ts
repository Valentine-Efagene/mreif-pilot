
import { HttpService } from '@nestjs/axios';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';

@Injectable()
export class AuthService {
    constructor(
        private readonly httpService: HttpService,
    ) { }

    async authorize(identifier: string, password: string): Promise<string> {
        const apiUrl = `${process.env.api_base_url}/onboarding/login`;

        const payload = {
            identifier,
            password,
        };

        const { data } = await firstValueFrom(
            this.httpService.post(apiUrl, payload)
                .pipe(catchError((error: AxiosError) => {
                    console.log(error)
                    //this.logger.error(error.response.data);
                    throw new UnauthorizedException()
                }))
        )

        return data?.body?.token?.authToken
    }
}
