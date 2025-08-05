import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

function cookieExtractor(req: any) {
  // Имя куки должно совпадать с тем, что ты ставишь в res.cookie(...)
  return req?.cookies?.access_token || null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    // Жёстко гарантируем, что секрет есть (и тип = string)
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      throw new Error('JWT_SECRET is not set'); // ранний фейл, чтобы не ловить 500 позже
    }
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        cookieExtractor,
        ExtractJwt.fromAuthHeaderAsBearerToken(), // запасной вариант
      ]),
      ignoreExpiration: false,
      secretOrKey:JWT_SECRET,
      // algorithms: ['HS256'], // можно зафиксировать алгоритм
    });
  }

  // то, что вернёшь здесь, окажется в req.user
  async validate(payload: { userId: string }) {
    return { userId: payload.userId };
  }
}