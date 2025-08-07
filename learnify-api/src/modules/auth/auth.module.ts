import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { PrismaModule } from '@prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UserService } from '@/modules/user/user.service';
import { GqlAuthGuard } from '@/common/guards/gql-auth.guard';
import { TokenService } from './token.service';


@Module({
  imports: [
    PrismaModule, 
    PassportModule,
    JwtModule.register({
    secret: process.env.JWT_ACCESS_SECRET ?? 'dev-secret',
    signOptions: { expiresIn: '1h' },
  }), ],
  providers: [AuthService, AuthResolver, JwtModule, JwtStrategy, GqlAuthGuard, UserService, TokenService],
  exports: [GqlAuthGuard],
})
export class AuthModule {}