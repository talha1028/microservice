// resolvers/user.resolver.ts
import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UsersService } from '../services/users.service';
import { User } from '../model/user.model';
import { CreateUserInput } from '../graphql-dtos/createuser.input';
import { UpdateUserInput } from '../graphql-dtos/updateuser.input';
import { CurrentUser } from '../decorators/currentuser.decorator';
import { type UserPayload } from '../payload/user.payload';

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UsersService) {}

  // ✅ Get all users
  @Query(() => [User], { name: 'users' })
  async findAll() {
    return this.userService.getusers();
  }

  // ✅ Create user
  @Mutation(() => User)
  async createUser(@Args('data') data: CreateUserInput) {
    return this.userService.creatuser(data);
  }

  // ✅ Update user
  @Mutation(() => User)
  async updateUser(@Args('data') data: UpdateUserInput) {
    return this.userService.updateuser(data.id, data);
  }

  // ✅ Delete user (only if not SUPERADMIN self-deletion)
  @Mutation(() => Boolean)
  async deleteUser(
    @Args('id') id: number,
    @CurrentUser() user: UserPayload, // 👈 pulled from JWT
  ) {
    await this.userService.deleteuser(id, user.id);
    return true;
  }
}
