import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { RegisterInput } from './dto/register.input';
import { User } from '../user/user.entity'
import { AuthPayload } from './dto/auth-payload.model';

@Resolver(() => User)
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => AuthPayload)
  async register(@Args('data') data: RegisterInput) {
    return this.authService.register(data);
  }
  @Query(() => String)
  hello() {
    return 'Hello from Learnify!';
  }
  
}
