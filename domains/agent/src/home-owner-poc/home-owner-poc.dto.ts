import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { PreferredContactMethod } from './home-owner-poc.enums';
import { IsArray, IsNotEmpty, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateHomeOwnerPocDto {
  @ApiProperty({
    example: 'Rukevwe Ezewu'
  })
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    example: '24 Airport Road, Warri'
  })
  @IsOptional()
  businessAddress: string;

  @ApiPropertyOptional({
    example: 'Delta'
  })
  @IsOptional()
  state: string;

  @ApiPropertyOptional({
    example: 'Nigeria'
  })
  @IsOptional()
  country: string;

  @ApiProperty({
    example: '02034234543'
  })
  @IsNotEmpty()
  phoneNumber: string;

  @ApiProperty({
    example: 'ruk@qshelter.test.ng'
  })
  @IsNotEmpty()
  email: string;

  @ApiPropertyOptional({
    type: 'enum',
    enum: PreferredContactMethod,
    example: PreferredContactMethod.EMAIL,
    default: PreferredContactMethod.EMAIL,
  })
  @IsOptional()
  preferredContactMethod: PreferredContactMethod;

  @ApiProperty({
    example: 1,
  })
  @IsNotEmpty()
  homeOwnerId: number;
}

export class UpdateHomeOwnerPocDto {
  @ApiProperty({
    example: 'Rukevwe Ezewu'
  })
  @IsOptional()
  name: string;

  @ApiProperty({
    example: '24 Airport Road, Warri'
  })
  @IsOptional()
  businessAddress: string;

  @ApiProperty({
    example: 'Delta'
  })
  @IsOptional()
  state: string;

  @ApiProperty({
    example: 'Nigeria'
  })
  @IsOptional()
  country: string;

  @ApiProperty({
    example: '02034234543'
  })
  @IsOptional()
  phoneNumber: string;

  @ApiProperty({
    example: 'ruk@qshelter.test.ng'
  })
  @IsOptional()
  email: string;

  @ApiProperty({
    type: 'enum',
    enum: PreferredContactMethod,
    example: PreferredContactMethod.EMAIL,
    default: PreferredContactMethod.EMAIL,
  })
  @IsOptional()
  preferredContactMethod: PreferredContactMethod;
}

export class BulkCreateHomeOwnerPocDto extends OmitType(CreateHomeOwnerPocDto, ['homeOwnerId'] as const) {

}

export class CreateManyHomeOwnerPocsDto {
  @ApiProperty({
    example: 1,
  })
  @IsNotEmpty()
  homeOwnerId: number;

  @ApiProperty({
    type: [BulkCreateHomeOwnerPocDto],
    description: 'Array of HomeOwner POCs',
    example: [
      {
        name: 'John Smith',
        businessAddress: '32 New Road, Lagos',
        country: 'Nigeria',
        state: 'Lagos',
        phoneNumber: '08012345678',
        email: 'johnsmith@testmail.ng',
        preferredContactMethod: PreferredContactMethod.EMAIL,
      },
      {
        name: 'Jane Smith',
        businessAddress: '32 New Road, Lagos',
        country: 'Nigeria',
        state: 'Lagos',
        phoneNumber: '08012345678',
        email: 'johnsmith@testmail.ng',
        preferredContactMethod: PreferredContactMethod.EMAIL,
      },
    ],
  })
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkCreateHomeOwnerPocDto)
  homeOwnerPocs: BulkCreateHomeOwnerPocDto[];
}
