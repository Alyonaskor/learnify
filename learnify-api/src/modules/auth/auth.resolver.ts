import { Resolver, Mutation, Args, Query, Context } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { RegisterInput } from './dto/register.input';
import { User } from '../user/user.entity';
import { AuthPayload } from './dto/auth-payload.model';
import { Response } from 'express';
import { GqlAuthGuard } from './gql-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserService } from '../user/user.service';
import { UseGuards } from '@nestjs/common';

@Resolver(() => User)
export class AuthResolver {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @UseGuards(GqlAuthGuard)
  @Query(() => User)
  async me(@CurrentUser() user: { userId: string }) {
    return this.userService.findById(user.userId);
  }
  @Mutation(() => AuthPayload)
  async register(
    @Args('data') data: RegisterInput,
    @Context('res') res: Response, // для установки cookie
  ) {
    const { token, user } = await this.authService.register(data)
    // Устанавливаем токен в cookie
    res.cookie('access_token', token, {
      httpOnly: true, // Нельзя получить через JavaScript
      secure: process.env.NODE_ENV === 'production', // Только по HTTPS в продакшн
      sameSite: 'lax', // Защита от CSRF атак
      maxAge: 1000 * 60 * 60 * 24 * 7, // Токен действует 7 дней
    });
    return { token, user };
  }
}
