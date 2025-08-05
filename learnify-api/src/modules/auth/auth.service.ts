import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as argon2 from 'argon2';
import { PrismaService } from '../../../prisma/prisma.service';
import { RegisterInput } from './dto/register.input';
import { JwtService } from '@nestjs/jwt';


@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService,
              private readonly jwtService: JwtService
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

  async register(data: RegisterInput) {
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
      const payload = { id: user.id, email: user.email };
      const token = this.jwtService.sign(payload);
  
      return { token, user };
    } catch (e) {
      // uniqueness race
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      ) {
        throw new ConflictException(
          'A user with this email already exists',
        );
      }
      throw new InternalServerErrorException(
        'Failed to register user',
      );
    }
  }
}
