import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsUrl, MaxLength, ValidateNested } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateDeveloperDocumentControllerDto {
  @ApiPropertyOptional({ nullable: true, example: 'Bank Statement' })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ nullable: false, example: 'https://example.com/document.pdf' })
  @Transform(({ value }) => encodeURI(value))
  @IsUrl()
  @IsNotEmpty()
  url: string;

  @ApiPropertyOptional({ nullable: true })
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional({ nullable: true })
  @Transform(({ value }) => parseInt(value, 10), { toClassOnly: true })
  @IsOptional()
  @IsNumber()
  size: number;

  @ApiProperty({ nullable: false, example: 1 })
  @IsNotEmpty()
  developerId: number;
}

export class CreateDeveloperDocumentDto {
  @ApiProperty()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({ nullable: true })
  @MaxLength(255)
  description: string;

  @ApiProperty({ nullable: false, example: 'https://example.com/document.pdf' })
  @Transform(({ value }) => encodeURI(value))
  @IsUrl()
  @IsNotEmpty()
  url: string;

  @ApiProperty({ example: 1 })
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  developerId: number;

  @ApiPropertyOptional({ nullable: true })
  @Transform(({ value }) => parseInt(value, 10), { toClassOnly: true })
  @IsOptional()
  @IsNumber()
  size: number;
}

export class BulkCreateDeveloperDocumentDto extends OmitType(CreateDeveloperDocumentDto, ['developerId'] as const) {

}

export class CreateManyDeveloperDocumentsDto {
  @ApiProperty({
    example: 1,
  })
  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value, 10), { toClassOnly: true })
  developerId: number;

  @ApiProperty({
    type: [CreateDeveloperDocumentDto],
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
  @Type(() => BulkCreateDeveloperDocumentDto)
  developerDocuments: BulkCreateDeveloperDocumentDto[];
}
