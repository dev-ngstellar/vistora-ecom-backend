import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken';
import { env } from '../config/env.config';
import { AuthUserPayload } from '../types/auth-user.type';
import { ApiError } from './api-error.util';

export interface TokenPayload extends JwtPayload, AuthUserPayload {}

export class JwtUtil {
  public static generateAccessToken(user: AuthUserPayload): string {
    const options: SignOptions = {
      expiresIn: env.JWT_EXPIRES_IN as unknown as SignOptions['expiresIn'],
    };

    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        roleId: user.roleId,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      env.JWT_SECRET,
      options,
    );
  }

  public static generateRefreshToken(userId: string): string {
    const options: SignOptions = {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN as unknown as SignOptions['expiresIn'],
    };

    return jwt.sign({ id: userId }, env.JWT_REFRESH_SECRET, options);
  }

  public static verifyAccessToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw ApiError.unauthorized('Access token has expired');
      }
      throw ApiError.unauthorized('Invalid access token');
    }
  }

  public static verifyRefreshToken(token: string): { id: string } & JwtPayload {
    try {
      return jwt.verify(token, env.JWT_REFRESH_SECRET) as { id: string } & JwtPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw ApiError.unauthorized('Refresh token has expired');
      }
      throw ApiError.unauthorized('Invalid refresh token');
    }
  }
}
