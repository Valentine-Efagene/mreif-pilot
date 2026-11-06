import { BadRequestException, HttpStatus, InternalServerErrorException, UnauthorizedException } from "@nestjs/common";
import { AxiosError } from "axios";
import { AxiosErrorCode } from "../common.enum";

export default class ErrorHelper {
    public static appropriateError(error: AxiosError) {
        const method = error?.config?.method?.toUpperCase();
        const url = error?.config?.url;
        const endpoint = method && url ? `${method} ${url}` : 'Unknown endpoint';

        if (error.code == AxiosErrorCode.ECONNREFUSED) {
            return new InternalServerErrorException(`Connection refused by third party ${endpoint}`)
        }

        const _message = error?.response?.data?.['message']
        const message = `3rd party error from ${endpoint}: ${_message ?? 'No message provided'}`;

        switch (error?.response?.status) {
            case HttpStatus.BAD_REQUEST:
                return new BadRequestException(message)

            case HttpStatus.UNAUTHORIZED:
                return new UnauthorizedException(message)

            default:
                return new BadRequestException(message)
        }
    }
}