import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UsersService } from '../services/users.service';
import { User } from '../model/user.model';
import { CreateUserInput } from '../graphql-dtos/createuser.input';
import { UpdateUserInput } from '../graphql-dtos/updateuser.input';

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UsersService) {}

  @Query(() => [User], { name: 'users' })
  findAll() {
    return this.userService.getusers();
  }

  @Mutation(() => User)
  createUser(@Args('data') data: CreateUserInput) {
    return this.userService.creatuser(data);
  }

  @Mutation(() => User)
  updateUser(@Args('data') data: UpdateUserInput) {
    return this.userService.updateuser(data.id, data);
  }

  @Mutation(() => Boolean)
  removeUser(@Args('id') id: number) {
    return this.userService.deleteuser(id);
  }
}
