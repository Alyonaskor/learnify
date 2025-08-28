import type { Response, CookieOptions } from 'express';

export const ACCESS_TOKEN = 'access_token';
export const REFRESH_TOKEN = 'refresh_token';

/**
 * Базовые опции куки.
 * - В DEV: работают на https://localhost, domain не указываем.
 * - В PROD: secure=true, sameSite обычно 'lax', domain можно НЕ указывать (host-only на api-домене).
 *   При необходимости — переопределяешь через ENV.
 */
const baseCookieOpts: CookieOptions = {
  httpOnly: true,
  sameSite: (process.env.APP_COOKIE_SAMESITE as CookieOptions['sameSite']) ?? 'lax',
  secure:
    process.env.APP_COOKIE_SECURE != null
      ? process.env.APP_COOKIE_SECURE === 'true'
      : process.env.NODE_ENV === 'production',
  path: '/',
  // В DEV и для localhost — НЕ указывать domain.
  // В PROD — чаще тоже не нужно (host-only на api-домене безопаснее).
  // Укажи только если осознанно хочешь шарить между поддоменами.
  domain: process.env.APP_COOKIE_DOMAIN || undefined,
};

export function setCookie(res: Response, name: string, value: string, maxAgeSeconds: number) {
  res.cookie(name, value, { ...baseCookieOpts, maxAge: maxAgeSeconds * 1000 });
}

export function clearCookie(res: Response, name: string) {
  // ВАЖНО: те же path/secure/sameSite/domain — иначе браузер может не удалить куку.
  res.cookie(name, '', { ...baseCookieOpts, maxAge: 0 });
}
/**
 * (Опционально) Удобный геттер — если где-то нужно прочитать куку.
 * Работает только если у тебя подключён cookie-parser.
 */
export function getCookie(req: any, name: string): string | undefined {
  return req?.cookies?.[name];
}