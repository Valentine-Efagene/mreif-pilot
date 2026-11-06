import { ApiExtraModels } from "@nestjs/swagger";

@ApiExtraModels(StandardApiResponse)
export class StandardApiResponse<T = any> {
    statusCode: number;
    message: string;
    data?: T;

    constructor(statusCode: number, message: string, data?: T) {
        this.message = message;
        this.statusCode = statusCode;
        this.data = data;
    }
}
