import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { verifyJwt } from './jwt.utils';
import { Request } from 'express';

@Injectable()
export class JwtGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const ctx = GqlExecutionContext.create(context);
    const req: Request = ctx.getContext().req;

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return false;
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyJwt(token);
    if (!payload || typeof payload !== 'object' || !('userId' in payload)) {
      return false;
    }

    // прикрепляем пользователя в GraphQL Context
    (req as any).user = { id: payload.userId };
    return true;
  }
}