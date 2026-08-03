import { NextFunction, Request, Response } from 'express';
import { ApiError } from '../utils/api-error.util';
import { asyncHandler } from '../utils/async-handler.util';
import { JwtUtil } from '../utils/jwt.util';

export const authenticate = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    let token: string | undefined;

    // 1. Extract from Authorization Header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies['accessToken']) {
      // 2. Extract from HTTP-only Cookie
      token = req.cookies['accessToken'];
    }

    if (!token) {
      throw ApiError.unauthorized('Authentication token is required');
    }

    // 3. Verify JWT Access Token
    const payload = JwtUtil.verifyAccessToken(token);

    // 4. Attach decoded user payload to Request context
    req.user = {
      id: payload.id,
      email: payload.email,
      role: payload.role,
      roleId: payload.roleId,
      firstName: payload.firstName,
      lastName: payload.lastName,
    };

    next();
  },
);
