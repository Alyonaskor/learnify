import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { verifyJwt } from './jwt.utils';
import { Request } from 'express';

@Injectable()
export class JwtGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const ctx = GqlExecutionContext.create(context);
    const req: Request = ctx.getContext().req;
     // 1) Пытаемся взять токен из httpOnly cookie
     const cookieToken = (req as any)?.cookies?.access_token;
     

     // 2) Или из Authorization: Bearer ...
     const authHeader = req.headers.authorization;
     const headerToken =
       authHeader && authHeader.startsWith('Bearer ')
         ? authHeader.slice('Bearer '.length)
         : undefined;
 
     const token = cookieToken ?? headerToken;
     if (!token) return false;
 
     const payload = verifyJwt(token);
     if (!payload || typeof payload !== 'object' || !('userId' in payload)) {
       return false;
     }
    // прикрепляем пользователя в GraphQL Context
    // ВАЖНО: единый формат для всего кода
    req.user = { userId: (payload as any).userId };
    return true;
  }
}