import { ApiProperty, OmitType } from '@nestjs/swagger';
import { PreferredContactMethod } from './developer-poc.enums';
import { IsArray, IsNotEmpty, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateDeveloperPocDto {
  @ApiProperty({
    example: 'Rukevwe Ezewu'
  })
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'Customer Relations Officer'
  })
  @IsNotEmpty()
  position: string;

  @ApiProperty({
    example: '24 Airport Road, Warri'
  })
  @IsNotEmpty()
  businessAddress: string;

  @ApiProperty({
    example: 'Delta'
  })
  @IsNotEmpty()
  state: string;

  @ApiProperty({
    example: 'Nigeria'
  })
  @IsNotEmpty()
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

  @ApiProperty({
    type: 'enum',
    enum: PreferredContactMethod,
    example: PreferredContactMethod.EMAIL,
    default: PreferredContactMethod.EMAIL,
  })
  @IsNotEmpty()
  preferredContactMethod: PreferredContactMethod;

  @ApiProperty({
    example: 1,
  })
  @IsNotEmpty()
  developerId: number;
}

export class UpdateDeveloperPocDto {
  @ApiProperty({
    example: 'Rukevwe Ezewu'
  })
  @IsOptional()
  name: string;

  @ApiProperty({
    example: 'Customer Relations Officer'
  })
  @IsOptional()
  position: string;

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

export class BulkCreateDeveloperPocDto extends OmitType(CreateDeveloperPocDto, ['developerId'] as const) {

}

export class CreateManyDeveloperPocsDto {
  @ApiProperty({
    example: 1,
  })
  @IsNotEmpty()
  developerId: number;

  @ApiProperty({
    type: [BulkCreateDeveloperPocDto],
    description: 'Array of Developer POCs',
    example: [
      {
        name: 'John Smith',
        position: 'COO',
        businessAddress: '32 New Road, Lagos',
        country: 'Nigeria',
        state: 'Lagos',
        phoneNumber: '08012345678',
        email: 'johnsmith@testmail.ng',
        preferredContactMethod: PreferredContactMethod.EMAIL,
      },
      {
        name: 'Jane Smith',
        position: 'COO',
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
  @Type(() => BulkCreateDeveloperPocDto)
  developerPocs: BulkCreateDeveloperPocDto[];
}
