import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsInt, IsNotEmpty, IsOptional, IsPhoneNumber, IsString, IsUrl } from 'class-validator';
import { LicenseType } from './pmb.enums';
import { Transform } from 'class-transformer';
import { IsNigerianPhoneNumber } from '../common/validator/IsNigerianPhoneNumber';

export class LogoUploadDto {
  @ApiProperty({
    format: 'binary',
    description:
      'Image with max size of 10MB. The image will be resized before upload',
    example: 'example.jpg',
  })
  @IsNotEmpty()
  file: Express.Multer.File;
}

export class UpdatePmbDto {
  @ApiPropertyOptional({
    nullable: true,
    example: 'Jane Doe'
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    nullable: true,
    example: '4837483'
  })
  @IsString()
  @IsOptional()
  rcNumber?: string;

  @ApiPropertyOptional({
    nullable: true,
    example: '7483'
  })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({
    nullable: true,
    type: 'enum',
    enum: LicenseType,
    example: LicenseType.NATIONAL,
  })
  @IsEnum(LicenseType)
  @IsOptional()
  licenseType?: LicenseType;

  @ApiPropertyOptional({
    nullable: true,
    example: '30900'
  })
  @IsOptional()
  postalAddress?: string;

  @ApiPropertyOptional({
    nullable: true,
    example: '30 Khan Street'
  })
  @IsOptional()
  headOfficeAddress?: string;

  @ApiPropertyOptional({
    nullable: true,
    example: '+23478548834'
  })
  @IsOptional()
  @IsPhoneNumber('NG', {
    message(validationArguments) {
      return `${validationArguments.property} must have the Nigerian format of +234...`
    },
  })
  mobile?: string;

  @ApiPropertyOptional({
    description: 'Nigerian phone number (mobile or landline). Can start with +234 or 0.',
    example: '+2342012808822',
    nullable: true,
  })
  @IsOptional()
  @IsNigerianPhoneNumber()
  phone?: string;

  @ApiPropertyOptional({
    nullable: true,
    example: 'oghenemaro@testmail.com'
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    nullable: true,
    example: 'testmail.com'
  })
  @IsOptional()
  @IsString()
  domain?: string;

  @ApiPropertyOptional({
    nullable: true,
    example: 'cnn.com'
  })
  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiPropertyOptional({
    nullable: true,
    example: null
  })
  @IsOptional()
  @IsUrl()
  logo?: string;

  // admin
  // @ApiPropertyOptional({ nullable: true, example: 1 })
  // @IsOptional()
  // @IsInt()
  // userId?: number;
}

export class CreatePmbDto extends UpdatePmbDto {

}

export class AssignAdminDto {
  @ApiProperty()
  @IsInt()
  pmbId?: number

  @ApiProperty()
  @IsInt()
  userId: number
}

export class RestorePmbDto {
  @ApiProperty({
    example: 1
  })
  @IsInt()
  id?: number
}

export class AvatarUploadDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'The file to be uploaded',
    example: 'example.pdf',
  })
  file: Express.Multer.File;
}

export class PmbNumberGenerationDto {

}

export class SinglePmbStatsDto {
  @ApiProperty()
  @Transform(({ value }) => parseFloat(value))
  customersOnActiveLoans?: number

  @ApiProperty()
  @Transform(({ value }) => parseFloat(value))
  activeCustomers: number

  @ApiProperty()
  @Transform(({ value }) => parseFloat(value))
  allCustomers: number

  @ApiProperty()
  @Transform(({ value }) => parseFloat(value))
  customersOnPendingLoans: number

  @ApiProperty()
  @Transform(({ value }) => parseFloat(value))
  customersOnClosedLoans: number

  @ApiProperty()
  @Transform(({ value }) => parseFloat(value))
  customersOnCancelledLoans: number
}