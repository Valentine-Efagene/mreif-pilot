import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty } from 'class-validator';
import { App } from './notification.enums';

export class BaseTemplateEmailDto {
  @ApiProperty({
    example: App.CONTRIBUILD,
    enum: App,
    type: 'enum'
  })
  @IsEnum(App)
  app: App;

  @ApiProperty({
    example: "efagenevalentine@gmail.com",
  })
  @IsEmail()
  to_email: string;
}

export class RsaApplicationApprovedDto extends BaseTemplateEmailDto {
  @ApiProperty({ example: '' })
  @IsNotEmpty()
  firstname: string;
}

export class RsaApplicationDeclinedDto extends BaseTemplateEmailDto {
  @ApiProperty({ example: '' })
  @IsNotEmpty()
  firstname: string;
}

export class RsaApplicationAcknowledgementDto extends BaseTemplateEmailDto {
  @ApiProperty({ example: '' })
  @IsNotEmpty()
  firstname: string;
}