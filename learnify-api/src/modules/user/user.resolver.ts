import { Resolver,Query } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from '@/modules/user/user.entity';
import { GqlAuthGuard } from '@/common/guards/gql-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';



@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}
  @UseGuards(GqlAuthGuard)
  @Query(() => User, { name: 'me' })
  me(@CurrentUser() user: { id: string }) {
    return this.userService.findById(user.id);
  }
}
