import { Resolver,Query } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { UserOutput } from '@/modules/user/user.entity';
import { GqlAuthGuard } from '@/common/guards/gql-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';



@Resolver(() => UserOutput)
export class UserResolver {
  constructor(private readonly userService: UserService) {}
  @UseGuards(GqlAuthGuard)
  
  @Query(() => UserOutput, { name: 'me' })
  me(@CurrentUser() user: { id: string }) {
    return this.userService.findById(user.id);
  }
}
