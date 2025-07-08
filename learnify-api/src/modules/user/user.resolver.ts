import { Resolver,Query } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from '../user/user.entity'
import { JwtGuard } from '../auth/jwt.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';



@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}
  @UseGuards(JwtGuard)
  @Query(() => User, { name: 'me' })
  me(@CurrentUser() user: { id: string }) {
    return this.userService.findById(user.id);
  }

  @Query(() => String)
  hello() {
    return 'Hello from Learnify!';
  }
  
}
