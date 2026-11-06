import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ArgsType, Field, Int, ObjectType } from '@nestjs/graphql';
import { Referral } from './referral.entity';
import { PaginationMeta } from '../common/common.dto';

@ArgsType()
export class CreateReferralDto {
  @ApiProperty({
    nullable: true,
    description: 'Agent ID',
    example: 1
  })
  @Field(() => Int)
  referrerId: number;

  @ApiProperty({
    nullable: true,
    example: 1,
    description: 'User ID'
  })
  @Field(() => Int)
  referreeId: number;
}

@ArgsType()
export class UpdateReferralDto {
  @ApiPropertyOptional({
    nullable: true,
    description: 'Agent ID'
  })
  @Field(() => Int)
  id: number;
}

@ObjectType()
export class PaginatedReferrals {
  @Field(() => [Referral])
  data: Referral[];

  @Field(() => PaginationMeta)
  meta: PaginationMeta;
}
