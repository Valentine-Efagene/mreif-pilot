import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, MaxLength } from "class-validator";

export class SignInDto {
    @ApiProperty({
        example: 'admin@admin.com',
    })
    @IsNotEmpty()
    @MaxLength(50)
    identifier: string;

    @ApiProperty({
        example: 12345678,
    })
    @IsNotEmpty()
    @MaxLength(50)
    password: string;
}