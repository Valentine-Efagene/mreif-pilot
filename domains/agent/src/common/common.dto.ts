import {
  ApiExtraModels,
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsEnum,
  IsString,
  IsNumberString,
  IsInt,
  Min,
  IsOptional,
} from 'class-validator';
import { DocumentStatus, MediaType } from './common.type';
import { ArgsType, Field, Int, ObjectType } from '@nestjs/graphql';
import { GraphQLScalarType, Kind } from 'graphql';
import { Transform } from 'class-transformer';

export const Upload = new GraphQLScalarType({
  name: 'Upload',
  description: 'A file upload scalar type',
  parseValue(value: any) {
    return value;
  },
  serialize(value: any) {
    return value;
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return ast.value;
    }
    return null;
  },
});

export class Document {
  url: string;
  name: string;
  description: string;
}

export class ApproveDocumentDto {
  @ApiProperty({ nullable: false, example: 1 })
  @IsNotEmpty()
  reviewerId: number;
}

export class UpdateDocumentStatusDto {
  @ApiProperty({
    nullable: false,
    enum: DocumentStatus,
    example: DocumentStatus.APPROVED,
  })
  @IsNotEmpty()
  @IsEnum(DocumentStatus)
  status: DocumentStatus;

  @ApiPropertyOptional({
    description: 'Required for declines',
  })
  declineReason: string;

  @ApiProperty({ nullable: false, example: 1 })
  @IsNotEmpty()
  reviewerId: number;
}

export class UpdateDocumentDto {
  @ApiPropertyOptional({ nullable: true })
  name?: string;

  @ApiPropertyOptional({ nullable: true })
  description?: string;

  @ApiPropertyOptional({ nullable: true })
  url?: string;

  @ApiPropertyOptional({
    nullable: true,
    type: 'enum',
    enum: MediaType,
  })
  mediaType?: MediaType;
}

export class DeclineDocumentDto {
  @ApiProperty({ nullable: false })
  @IsNotEmpty()
  @IsString()
  declineReason?: string;

  @ApiProperty({ nullable: false, example: 1 })
  @IsNotEmpty()
  @IsString()
  reviewerId: number;
}

@ApiExtraModels(StandardApiResponse)
export class StandardApiResponse<T = any> {
  statusCode: number;
  message: string;
  data?: T;

  constructor(statusCode: number, message: string, data?: T) {
    this.message = message;
    this.statusCode = statusCode;
    this.data = data;
  }
}

export class DocumentReuploadDto {
  @ApiProperty({
    nullable: false,
    description: 'ID of the file to replace',
  })
  @IsNotEmpty()
  @IsNumberString()
  id: number;

  @ApiPropertyOptional({
    nullable: true,
    description: 'Optional new name for the file',
  })
  name?: string;

  @ApiPropertyOptional({
    nullable: true,
    description: 'Optional new description for the file',
  })
  description?: string;
}

@ArgsType()
export class PaginationArgs {
  @Field(() => Int)
  @IsInt()
  @IsOptional()
  @Min(1)
  page: number;

  @Field(() => Int)
  @IsOptional()
  @IsInt()
  @Min(1)
  limit: number;

  // @Field(() => Int)
  // sortBy?: [string, string][];

  @Field(() => String, { nullable: true })
  @IsOptional()
  searchBy?: string[];

  @Field(() => String, { nullable: true })
  @IsOptional()
  search?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  select?: string[];
}

@ObjectType()
export class FilterInput {
  @Field(() => String)
  column: string;

  @Field(() => [String], { nullable: true })
  values?: string[];
}

@ObjectType()
export class PaginationMeta {
  @Field(() => Int)
  itemsPerPage: number;

  @Field(() => Int)
  totalItems: number;

  @Field(() => Int)
  currentPage: number;

  @Field(() => Int)
  totalPages: number;

  @Field(() => [String])
  sortBy?: string[];

  @Field(() => [String])
  searchBy?: string[];

  @Field(() => String, { nullable: true })
  search?: string;

  @Field(() => [String], { nullable: true })
  select?: string[];

  @Field(() => [FilterInput], { nullable: true })
  filter?: FilterInput[];
}

export declare class Paginated<T> {
  data: T[];
  meta: {
    itemsPerPage: number;
    totalItems: number;
    currentPage: number;
    totalPages: number;
    sortBy?: string[];
    searchBy?: string[];
    search?: string;
    select?: string[];
    filter?: {
      [column: string]: string | string[];
    };
  };
  // links: {
  //   first?: string;
  //   previous?: string;
  //   current: string;
  //   next?: string;
  //   last?: string;
  // };
}

@ObjectType()
export class PaginationDto {
  @Field(() => [Int])
  @ApiPropertyOptional({
    default: 1
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  page: number;

  @Field(() => [Int])
  @ApiPropertyOptional({
    default: 20
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  limit: number;
}
