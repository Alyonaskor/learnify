// src/auth/auth.service.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { signJwt } from './jwt.strategy';

const prisma = new PrismaClient();

export class AuthService {
  async register(email: string, password: string) {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new Error('Пользователь с таким email уже существует');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    const token = signJwt({ userId: user.id });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
      },
    };
  }
}
