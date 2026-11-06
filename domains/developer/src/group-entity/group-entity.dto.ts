import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsOptional, ValidateNested } from 'class-validator';

export class CreateGroupEntityDto {
  @ApiProperty({
    example: 'Meta',
    description: 'asdakjlksdlf',
  })
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'FJCW940F9W09FJW',
  })
  @IsNotEmpty()
  rcNumber: string;

  @ApiProperty({
    example: 1,
  })
  @IsNotEmpty()
  developerId: number;
}

export class UpdateGroupEntityDto {
  @ApiPropertyOptional({
    example: 'Meta',
  })
  name: string;

  @ApiPropertyOptional({
    example: 'FJCW940F9W09FJW',
  })
  rcNumber: string;
}

export class BulkCreateGroupEntityDto extends OmitType(CreateGroupEntityDto, ['developerId'] as const) {

}

export class CreateManyGroupEntitiesDto {
  @ApiProperty({
    example: 1,
  })
  @IsNotEmpty()
  developerId: number;

  @ApiProperty({
    type: [BulkCreateGroupEntityDto],
    description: 'Array of Group Entities',
    example: [
      {
        name: 'Meta',
        rcNumber: 'FJCW940F9W09FJW',
      },
      {
        name: 'Meta2',
        rcNumber: 'FJCW940F9W09FJW',
      },
      {
        name: 'Meta3',
        rcNumber: 'FJCW940F9W09FJW',
      },
    ],
  })
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkCreateGroupEntityDto)
  groupEntities: BulkCreateGroupEntityDto[];
}
