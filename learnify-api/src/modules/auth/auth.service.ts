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

  /*REGISTER*/
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
        select: { id: true, email: true, name: true, createdAt: true, updatedAt: true },
      });
      const { accessToken, refreshToken } = 
      await this.tokenService.generateTokens(user.id);
       // сохраняем refresh в БД
    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });
      // Устанавливаем токен в cookie
      const isProd = process.env.NODE_ENV === 'production';
      res.cookie('access_token', accessToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? 'none' : 'lax',
        maxAge: 1000 * 60 * 15,
      });
      res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? 'none' : 'lax',
        maxAge: 1000 * 60 * 60 * 24 * 30,
      });
      return { accessToken, refreshToken, user };
    } catch (e) {
      // uniqueness race
      if (
        e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new ConflictException('A user with this email already exists');
      }
      throw new InternalServerErrorException('Failed to register user');
    }
  }

  /*LOGIN*/
  async login(input: LoginInput, res: Response) {
    const user = await this.usersService.findByEmailForAuth(input.email);
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
    const isProd = process.env.NODE_ENV === 'production';
  res.cookie('access_token', accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: 1000 * 60 * 15,
  });
  res.cookie('refresh_token', refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: 1000 * 60 * 60 * 24 * 30,
  });

    const safeUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return { accessToken, refreshToken, user: safeUser};
  }

  /*REFRESH*/
  async refresh(req: any, res: Response) {
    const isProd = process.env.NODE_ENV === 'production';
    const rt = req?.cookies?.['refresh_token']; // читаем из httpOnly куки
    if (!rt) throw new UnauthorizedException('No refresh token');

    // валидируем подпись refresh
    let payload: { sub: string };
    try {
      payload = await this.tokenService.verifyRefreshToken(rt) as any;
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
    // сверяем с тем, что лежит в БД (простая ротация/проверка)
    const userDb = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, 
        email: true, 
        name: true, 
        createdAt: true, 
        updatedAt: true, 
        refreshToken: true  
      }, 
    });
    if (!userDb) throw new UnauthorizedException('User not found');

     // сверяем refresh c тем, что в базе
     if (!userDb.refreshToken || userDb.refreshToken !== rt) {
      throw new UnauthorizedException('Refresh mismatch');
    }
    const { accessToken, refreshToken } = await this.tokenService.generateTokens(userDb.id);
     // ротация refresh в БД
     await this.prisma.user.update({
      where: { id: userDb.id },
      data: { refreshToken },
    });
    // перезаписываем куки
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      maxAge: 1000 * 60 * 15,
    });
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 30,
    });
// 6) готовим «безопасного» юзера под UserOutput
const userSafe = {
  id: userDb.id,
  email: userDb.email,
  name: userDb.name,
  createdAt: userDb.createdAt,
  updatedAt: userDb.updatedAt,
};
    return { accessToken, refreshToken, user: userSafe };
  }
  async logout(res: Response) {
    // Удаляем куки
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    });
    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    });
    return { message: 'Logged out successfully' };
  }
}
