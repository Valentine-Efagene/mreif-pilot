import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { User } from './user.entity';
import { UserService } from './user.service';
import { CreateUserDto, PaginatedUsers } from './user.dto';
import { PaginationArgs } from '../common/common.dto';

@Resolver((of) => User)
export default class UserResolver {
  constructor(private userService: UserService) {}

  @Query((returns) => User)
  async getUser(@Args('id', { type: () => Int }) id: number) {
    return this.userService.findOne(id);
  }

  @Mutation((returns) => User)
  async createUser(@Args() dto: CreateUserDto) {
    return this.userService.create(dto);
  }

  @Query(() => PaginatedUsers)
  async users(@Args() paginationArgs: PaginationArgs): Promise<PaginatedUsers> {
    // const paginationArgs: PaginationArgs = {
    //     limit,
    //     page
    // }
    const result = await this.userService.paginate(paginationArgs);
    return result;
  }
}
