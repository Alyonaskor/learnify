import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { RegisterInput } from './dto/register.input';
import { AuthPayload } from './dto/auth-payload.model';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => AuthPayload)
  async register(@Args('data') data: RegisterInput) {
    return this.authService.register(data);
  }
  // @Mutation(() => AuthResponse)
  // register(@Args('data') data: RegisterInput) {
  //   return this.authService.register(data);
  // }
}
