import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from './user.enums';
import { User } from './user.entity';
import { ArgsType, Field, ObjectType, PickType } from '@nestjs/graphql';
import { PaginationMeta } from '../common/common.dto';

@ArgsType()
export class CreateUserDto {
  @ApiProperty({ nullable: true, example: 'Jane' })
  @Field(() => String)
  firstName: string;

  @ApiProperty({ nullable: true, example: 'Doe' })
  @Field(() => String)
  lastName: string;

  @ApiProperty({ nullable: true, example: 'janedoe@testmail.com' })
  @Field(() => String)
  email: string;

  @ApiProperty({ nullable: true, example: ['agent'] })
  @Field(() => [String])
  roles: UserRole[];
}

export class UpdateUserDto {
  @ApiPropertyOptional({ nullable: true })
  id?: number;
}

@ObjectType()
export class PaginatedUsers {
  @Field(() => [User])
  data: User[];

  @Field(() => PaginationMeta)
  meta: PaginationMeta;
}

export class UserWithCommissionDto extends PickType(User, ['id', 'firstName', 'lastName', 'avatar', 'email', 'createdAt'] as const) {
  totalCommission: number
}
