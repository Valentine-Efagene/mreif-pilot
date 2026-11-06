import { ApiProperty, ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsArray, IsInt, IsNotEmpty, IsNumber, IsOptional, ValidateNested } from 'class-validator';

export class CreateDeveloperDirectorDocumentDto {
  @ApiProperty({ nullable: true })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ nullable: true })
  @IsNotEmpty()
  url: string;

  @ApiProperty({ nullable: true })
  @IsNotEmpty()
  description: string;

  @ApiProperty({ nullable: true })
  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value, 10), { toClassOnly: true })
  developerDirectorId: number;

  @ApiPropertyOptional({ nullable: true })
  @Transform(({ value }) => parseInt(value, 10), { toClassOnly: true })
  @IsOptional()
  @IsNumber()
  size: number;
}

export class UpdateDeveloperDirectorDocumentDto extends PartialType(
  OmitType(CreateDeveloperDirectorDocumentDto, ['developerDirectorId'] as const),
) {
}

export class BulkCreateDeveloperDirectorDocumentDto extends OmitType(CreateDeveloperDirectorDocumentDto, ['developerDirectorId'] as const) {

}

export class CreateManyDeveloperDocumentsDto {
  @ApiProperty({
    example: 1,
  })
  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value, 10), { toClassOnly: true })
  developerId: number;

  @ApiProperty({
    type: [CreateDeveloperDirectorDocumentDto],
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
  @Type(() => BulkCreateDeveloperDirectorDocumentDto)
  developerDocuments: BulkCreateDeveloperDirectorDocumentDto[];
}