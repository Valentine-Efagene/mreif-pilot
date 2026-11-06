import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { PreferredContactMethod } from './agent-poc.enums';
import { IsArray, IsNotEmpty, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAgentPocDto {
  @ApiPropertyOptional({
    example: 'Rukevwe Ezewu'
  })
  @IsOptional()
  firstName: string;

  @ApiPropertyOptional({
    example: 'Rukevwe Ezewu'
  })
  @IsOptional()
  lastName: string;

  @ApiPropertyOptional({
    example: '24 Airport Road, Warri'
  })
  @IsOptional()
  address: string;

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

  @ApiPropertyOptional({
    example: '02034234543'
  })
  @IsOptional()
  phoneNumber: string;

  @ApiPropertyOptional({
    example: 'ruk@qshelter.test.ng'
  })
  @IsOptional()
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
  agentId: number;
}

export class UpdateAgentPocDto {
  @ApiPropertyOptional({
    example: 'Rukevwe Ezewu'
  })
  @IsOptional()
  firstName: string;

  @ApiPropertyOptional({
    example: 'Rukevwe Ezewu'
  })
  @IsOptional()
  lastName: string;

  @ApiPropertyOptional({
    example: '24 Airport Road, Warri'
  })
  @IsOptional()
  address: string;

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

export class BulkCreateAgentPocDto extends OmitType(CreateAgentPocDto, ['agentId'] as const) {

}

export class CreateManyAgentPocsDto {
  @ApiProperty({
    example: 1,
  })
  @IsNotEmpty()
  agentId: number;

  @ApiProperty({
    type: [BulkCreateAgentPocDto],
    description: 'Array of Agent POCs',
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
  @Type(() => BulkCreateAgentPocDto)
  agentPocs: BulkCreateAgentPocDto[];
}
