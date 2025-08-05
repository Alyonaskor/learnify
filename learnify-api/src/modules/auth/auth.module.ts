import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { PrismaModule } from '../../../prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { UserService } from '../user/user.service';
import { GqlAuthGuard } from './gql-auth.guard';


@Module({
  imports: [
    PrismaModule, 
    PassportModule,
    JwtModule.register({
    secret: process.env.JWT_SECRET ?? 'dev-secret',
    signOptions: { expiresIn: '1h' },
  }), ],
  providers: [AuthService, AuthResolver, JwtModule, JwtStrategy, GqlAuthGuard, UserService],
  exports: [GqlAuthGuard],
})
export class AuthModule {}