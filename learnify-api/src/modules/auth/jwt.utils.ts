import jwt from 'jsonwebtoken'; 
const JWT_SECRET: jwt.Secret = process.env.JWT_SECRET || 'supersecret';

export function signJwt(
  payload: string | jwt.JwtPayload,
  expiresIn: jwt.SignOptions['expiresIn'] = '7d',
) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

export function verifyJwt(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}
