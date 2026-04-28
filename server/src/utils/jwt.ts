import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '../config';

export const generateToken = (userId: string, role: string) => {
  const options: SignOptions = {
    expiresIn: config.jwt.expiresIn as any,
  };
  return jwt.sign({ id: userId, role }, config.jwt.secret as string, options);
};

export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, config.jwt.secret as string) as { id: string; role: string };
  } catch (error) {
    return null;
  }
};
