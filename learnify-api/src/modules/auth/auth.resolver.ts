import { Resolver, Mutation, Args, Query, Context } from '@nestjs/graphql';
import { AuthService } from '@/modules/auth/auth.service';
import { RegisterInput } from './dto/register.input';
import { UserOutput } from '@/modules/user/user.output';
import { AuthPayload } from './dto/auth-payload.model';
import { Response as ExpressResponse } from 'express';
import { GqlAuthGuard } from  '@/common/guards/gql-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { UserService } from '@/modules/user/user.service';
import { UseGuards } from '@nestjs/common';
import { LoginInput } from './dto/login.input';
import { AuthResponse } from './dto/auth.response'

@Resolver(() => UserOutput)
export class AuthResolver {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @UseGuards(GqlAuthGuard)
  @Query(() => UserOutput)
  async me(@CurrentUser() user: { userId: string }) {
    return this.userService.findByIdSafe (user.userId);
  }
  @Mutation(() => AuthResponse)
  async register(
    @Args('data') data: RegisterInput,
    @Context('res')  res: unknown, // для установки cookie
  ) {
    return this.authService.register(data, res as ExpressResponse);
  }
  @Mutation(() => AuthResponse)
  async login(
    @Args('input') input: LoginInput,
    @Context() ctx): Promise<AuthResponse> {
    return this.authService.login(input, ctx.res);
  }
    @Mutation(() => AuthResponse)
  async refresh(
    @Context() ctx): Promise<AuthResponse> {
      return this.authService.refresh(ctx.req, ctx.res);
    }
   
  
}
