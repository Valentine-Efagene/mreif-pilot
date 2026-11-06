import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from './user.enums';

export class CreateUserDto {
  @ApiProperty({ nullable: true, example: 'Jane' })
  firstName: string;

  @ApiProperty({ nullable: true, example: 'Doe' })
  lastName: string;

  @ApiProperty({ nullable: true, example: 'janedoe@testmail.com' })
  email: string;

  @ApiPropertyOptional({ nullable: true, example: 1 })
  cooperativeId?: number;

  @ApiPropertyOptional({ nullable: true, example: 1 })
  pmbParentId?: number;

  @ApiProperty({ nullable: true, example: ['employer'] })
  roles: UserRole[];
}

export class UpdateUserDto {
  @ApiPropertyOptional({ nullable: true })
  id?: number;

  @ApiPropertyOptional()
  suspended?: boolean;
}