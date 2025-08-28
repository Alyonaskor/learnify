import type { Request, Response } from 'express';

export interface GqlContext {
  req: Request & { user?: any }; // если ты где-то навешиваешь user в guard/strategy
  res: Response;
}