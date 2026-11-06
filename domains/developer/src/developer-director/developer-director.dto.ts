import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsArray, IsDateString, IsNotEmpty, IsOptional, ValidateNested } from 'class-validator';
import { BulkCreateDeveloperDirectorDocumentDto } from '../developer-director-document/developer-director-document.dto';
import { BulkCreateDeveloperDocumentDto } from '../developer-document/developer-document.dto';
export class CreateDeveloperDirectorDto {
  @ApiProperty()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty()
  @IsNotEmpty()
  homeAddress: string;

  @ApiProperty({
    type: 'date',
    example: '2010-03-05',
  })
  @IsNotEmpty()
  @IsDateString()
  dateOfBirth: string;

  // @ApiProperty()
  // @IsNotEmpty()
  // bvn: string;

  @ApiProperty()
  @IsNotEmpty()
  phoneNumber: string;

  @ApiProperty()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 1,
  })
  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value, 10), { toClassOnly: true })
  developerId: number;
}

export class UpdateDeveloperDirectorDto {
  @ApiPropertyOptional()
  firstName: string;

  @ApiPropertyOptional()
  lastName: string;

  @ApiPropertyOptional()
  homeAddress: string;

  @ApiProperty({
    type: 'date',
    example: '1987-08-24T04:00:43.467Z',
  })
  dateOfBirth: string;

  // @ApiProperty()
  // @IsNotEmpty()
  // bvn: string;

  @ApiPropertyOptional()
  phoneNumber: string;

  @ApiPropertyOptional()
  email: string;
}


export class BulkCreateDeveloperDirectorDto extends OmitType(CreateDeveloperDirectorDto, ['developerId'] as const) {
  @ApiPropertyOptional({
    type: [BulkCreateDeveloperDirectorDocumentDto],
    description: 'Array of documents for the director',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkCreateDeveloperDirectorDocumentDto)
  documents?: BulkCreateDeveloperDirectorDocumentDto[];
}

export class CreateManyDeveloperDirectorsDto {
  @ApiProperty({
    example: 1,
  })
  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value, 10), { toClassOnly: true })
  developerId: number;

  @ApiProperty({
    type: [CreateDeveloperDirectorDto],
    example: [
      {
        firstName: 'Jane',
        lastName: 'Doe',
        homeAddress: '24th Street',
        dateOfBirth: new Date().toLocaleDateString(),
        // bvn: '222222222222',
        phoneNumber: '09075847832',
        email: 'janedoe@gmail.com',
      },
      {
        firstName: 'Jane',
        lastName: 'Doe',
        homeAddress: '24th Street',
        dateOfBirth: new Date().toLocaleDateString(),
        // bvn: '222222222222',
        phoneNumber: '09075847832',
        email: 'janedoe@gmail.com',
      },
      {
        firstName: 'Jane',
        lastName: 'Doe',
        homeAddress: '24th Street',
        dateOfBirth: new Date().toLocaleDateString(),
        // bvn: '222222222222',
        phoneNumber: '09075847832',
        email: 'janedoe@gmail.com',
      },
      {
        firstName: 'Jane',
        lastName: 'Doe',
        homeAddress: '24th Street',
        dateOfBirth: new Date().toLocaleDateString(),
        // bvn: '222222222222',
        phoneNumber: '09075847832',
        email: 'janedoe@gmail.com',
      },
    ],
    description: 'Array of developer directors to create',
  })
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkCreateDeveloperDirectorDto)
  developerDirectors: BulkCreateDeveloperDirectorDto[];
}
