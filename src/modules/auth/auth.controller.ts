import { CookieOptions, Request, Response } from 'express';
import { env } from '../../config/env.config';
import { HTTP_STATUS } from '../../constants/http-status.constant';
import { ApiResponseHandler } from '../../utils/api-response.util';
import { AuthService } from './auth.service';

const getCookieOptions = (): CookieOptions => ({
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: env.NODE_ENV === 'production' ? 'strict' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
});

export class AuthController {
  private readonly authService: AuthService;

  constructor(authService: AuthService = new AuthService()) {
    this.authService = authService;
  }

  public register = async (req: Request, res: Response): Promise<Response> => {
    const result = await this.authService.register(req.body);

    // Set refresh token in HTTP-only cookie
    res.cookie('refreshToken', result.tokens.refreshToken, getCookieOptions());

    return ApiResponseHandler.created(res, 'User registration completed successfully', {
      user: result.user,
      accessToken: result.tokens.accessToken,
      refreshToken: result.tokens.refreshToken,
    });
  };

  public login = async (req: Request, res: Response): Promise<Response> => {
    const metadata = {
      ipAddress: req.ip || req.socket.remoteAddress,
      userAgent: req.get('user-agent'),
    };

    const result = await this.authService.login(req.body, metadata);

    // Set refresh token in HTTP-only cookie
    res.cookie('refreshToken', result.tokens.refreshToken, getCookieOptions());

    return ApiResponseHandler.success(res, HTTP_STATUS.OK, 'Login successful', {
      user: result.user,
      accessToken: result.tokens.accessToken,
      refreshToken: result.tokens.refreshToken,
    });
  };

  public refreshToken = async (req: Request, res: Response): Promise<Response> => {
    const tokenFromCookie = req.cookies ? req.cookies['refreshToken'] : undefined;
    const tokenFromBody = req.body ? req.body.refreshToken : undefined;
    const token = tokenFromCookie || tokenFromBody;

    const metadata = {
      ipAddress: req.ip || req.socket.remoteAddress,
      userAgent: req.get('user-agent'),
    };

    const tokens = await this.authService.refreshToken(token, metadata);

    // Set rotated refresh token in HTTP-only cookie
    res.cookie('refreshToken', tokens.refreshToken, getCookieOptions());

    return ApiResponseHandler.success(res, HTTP_STATUS.OK, 'Tokens refreshed successfully', {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
  };

  public logout = async (req: Request, res: Response): Promise<Response> => {
    const tokenFromCookie = req.cookies ? req.cookies['refreshToken'] : undefined;
    const tokenFromBody = req.body ? req.body.refreshToken : undefined;
    const token = tokenFromCookie || tokenFromBody;
    const userId = req.user?.id;

    await this.authService.logout(token, userId);

    // Clear refresh token cookie
    res.clearCookie('refreshToken', getCookieOptions());

    return ApiResponseHandler.success(res, HTTP_STATUS.OK, 'Logout completed successfully', null);
  };

  public getCurrentUser = async (req: Request, res: Response): Promise<Response> => {
    const userId = req.user?.id;
    if (!userId) {
      return ApiResponseHandler.error(res, HTTP_STATUS.UNAUTHORIZED, 'Authentication required');
    }

    const context = await this.authService.getAuthenticatedUserContext(userId);

    return ApiResponseHandler.success(
      res,
      HTTP_STATUS.OK,
      'Current authenticated user context retrieved successfully',
      context,
    );
  };
}
