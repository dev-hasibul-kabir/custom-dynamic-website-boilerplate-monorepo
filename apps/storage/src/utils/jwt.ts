import jwt from 'jsonwebtoken';
import type { JwtPayload } from '../types/index.js';
import envVariables from './env.js';

export const generateToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, envVariables.JWT_SECRET, {
    algorithm: 'HS256',
  });
};

export const verifyToken = (token: string): JwtPayload | null => {
  try {
    const decoded = jwt.verify(token, envVariables.JWT_SECRET, {
      algorithms: ['HS256'],
    }) as JwtPayload;
    return decoded;
  } catch {
    return null;
  }
};

export const validateTokenPayload = (decoded: JwtPayload): boolean => {
  if (
    decoded.iss &&
    decoded.iss === 'example.com' &&
    decoded.sub &&
    decoded.email &&
    decoded.sub === decoded.email
  ) {
    return true;
  }
  return false;
};
