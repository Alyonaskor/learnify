// src/auth/auth.resolver.ts
import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { RegisterInput } from './dto/register.input';

@Resolver()
export class AuthResolver {
  private authService = new AuthService();

  @Mutation(() => String)
  async register(@Args('data') data: RegisterInput) {
    const result = await this.authService.register(data.email, data.password);
    return result.token; // or you can return the entire object
  }
}
