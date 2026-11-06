import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ArgsType, Field, Int, ObjectType, PickType } from '@nestjs/graphql';
import { Commission } from './commission.entity';
import { PaginationDto, PaginationMeta } from '../common/common.dto';
import { Transform, Type } from 'class-transformer';
import { User } from '../user/user.entity';
import { CommissionStatus } from './commission.enums';

@ArgsType()
export class CreateCommissionDto {
  @ApiProperty({ example: 1 })
  @Field(() => Int)
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  referralId: number;

  @ApiProperty({
    example: 100000000.5,
  })
  @IsNumber()
  @Type(() => Number)
  amount: number;
}

@ArgsType()
export class PostCommissionWithCodeDto {
  @ApiProperty({ example: 'eowieow' })
  @Field(() => String)
  @IsNotEmpty()
  referralCode: string;

  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  userId: number;

  @ApiProperty({
    example: 100000000.5,
  })
  @IsNumber()
  @Type(() => Number)
  amount: number;
}

@ArgsType()
export class UpdateCommissionDto {
  @Type(() => Number)
  @ApiPropertyOptional({
    nullable: true,
    example: 1000000
  })
  @Transform(({ value }) => parseFloat(value))
  @IsOptional()
  @IsNumber()
  amount?: number;

  @Type(() => String)
  @ApiPropertyOptional({
  })
  @IsOptional()
  @IsString()
  comment?: string

  @Field(() => CommissionStatus)
  @ApiPropertyOptional({
    type: 'enum',
    enum: CommissionStatus,
    example: CommissionStatus.PAID
  })
  @IsOptional()
  @IsEnum(CommissionStatus)
  status?: CommissionStatus
}

@ObjectType()
export class PaginatedCommissions {
  @Field(() => [Commission])
  data: Commission[];

  @Field(() => PaginationMeta)
  meta: PaginationMeta;
}

@ObjectType()
export class AgentCommissionPaginationDto extends PaginationDto {
}

@ObjectType()
export class Customer extends PickType(User, ['id', 'avatar', 'firstName', 'lastName', 'email', 'phone']) {

}

@ObjectType()
export class SinglePaginatedAgentCommission extends Commission {
  customer: Customer
}

@ObjectType()
export class PaginatedAgentCommissions {
  @Field(() => [Commission])
  data: SinglePaginatedAgentCommission[];

  @Field(() => PaginationMeta)
  meta: PaginationMeta;
}