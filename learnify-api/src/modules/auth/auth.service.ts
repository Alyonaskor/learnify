import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as argon2 from 'argon2';
import { PrismaService } from '@prisma/prisma.service';
import { RegisterInput } from './dto/register.input';
import { Response } from 'express';
import { TokenService } from './token.service';
import { UserService } from '@/modules/user/user.service';
import { LoginInput } from './dto/login.input';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UserService,
    private readonly prisma: PrismaService,
    private readonly tokenService: TokenService,
  ) {}

  private async hashPassword(password: string): Promise<string> {
    const timeCost = Number(process.env.ARGON2_TIME_COST ?? 3);
    const memoryCost = Number(process.env.ARGON2_MEMORY_COST ?? 65536);
    const parallelism = Number(process.env.ARGON2_PARALLELISM ?? 1);

    return argon2.hash(password, {
      type: argon2.argon2id,
      timeCost,
      memoryCost,
      parallelism,
    });
  }

  async register(data: RegisterInput, res: Response) {
    const { email, password, name } = data;
    const normalizedEmail = email.trim().toLowerCase(); // Normalize email
    /* because anyone can query your GraphQL directly: curl -X POST http://api/graphql -H 'content-type: application/json' \
    --data '{"query":"mutation{ register(data:{email:\"USER@X.COM\", password:\"a\" name:\"x\"}){ token }}"}' */

    try {
      const hashed = await this.hashPassword(password);
      // Check if user already exists
      const user = await this.prisma.user.create({
        data: { email: normalizedEmail, password: hashed, name },
        select: { id: true, email: true, name: true, createdAt: true },
      });
      const { accessToken } = await this.tokenService.generateTokens(user.id);
      // Устанавливаем токен в cookie
      res.cookie('access_token', accessToken, {
        httpOnly: true, // Нельзя получить через JavaScript document.cookie, защита от XSS
        secure: process.env.NODE_ENV === 'production', // Только по HTTPS в продакшн
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 1000 * 60 * 60 * 24 * 7, // Токен действует 7 дней
      });
      return { 
        accessToken, 
        user 
      };
    } catch (e) {
      // uniqueness race
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      ) {
        throw new ConflictException('A user with this email already exists');
      }
      throw new InternalServerErrorException('Failed to register user');
    }
  }
  async login(input: LoginInput, res: any) {
    const user = await this.usersService.findByEmail(input.email);
    if (!user) throw new UnauthorizedException('Неверный логин или пароль');

    const valid = await argon2.verify(user.password, input.password);
    if (!valid) throw new UnauthorizedException('Неверный логин или пароль');

    const { accessToken, refreshToken } =
      await this.tokenService.generateTokens(user.id);

    // Сохраняем refresh в БД (простейшая версия)
    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    // Устанавливаем httpOnly куки
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 1000 * 60 * 15, // 15 минут
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 дней
    });

    return {
      accessToken,
      refreshToken,
      user,
    };
  }
}
