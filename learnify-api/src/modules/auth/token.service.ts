import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class TokenService {
  constructor(private readonly jwtService: JwtService) {}

  // Отдельная генерация access
  async generateAccessToken(userId: string) {
    const payload = { sub: userId };
    return this.jwtService.signAsync(payload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: '15m',
    });
  }

  // Отдельная генерация refresh
  async generateRefreshToken(userId: string) {
    const payload = { sub: userId };
    return this.jwtService.signAsync(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: '30d',
    });
  }

  // Удобный комбинированный метод
  async generateTokens(userId: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.generateAccessToken(userId),
      this.generateRefreshToken(userId),
    ]);
    return { accessToken, refreshToken };
  }

  // Верификация refresh (используем refresh-секрет)
  async verifyRefreshToken(token: string) {
    return this.jwtService.verifyAsync(token, {
      secret: process.env.JWT_REFRESH_SECRET,
    });
  }
}
