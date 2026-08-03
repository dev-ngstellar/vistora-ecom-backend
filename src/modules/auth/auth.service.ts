import { AccountStatus, User, UserRole } from '@prisma/client';
import { UserRepository, UserSessionRepository, UserWithRole } from '../../repositories';
import { ApiError } from '../../utils/api-error.util';
import { JwtUtil } from '../../utils/jwt.util';
import { PasswordUtil } from '../../utils/password.util';
import {
  AuthSuccessResult,
  AuthTokens,
  LoginInput,
  RegisterInput,
  UserContextResponse,
  UserResponse,
} from './auth.types';

const ROLE_PERMISSIONS_MAP: Record<UserRole, string[]> = {
  [UserRole.SUPER_ADMIN]: ['*'],
  [UserRole.ADMIN]: [
    'manage:products',
    'manage:categories',
    'manage:brands',
    'manage:collections',
    'manage:inventory',
    'manage:orders',
    'manage:customers',
    'manage:coupons',
    'manage:reviews',
    'manage:banners',
    'manage:cms',
    'view:reports',
    'manage:settings',
  ],
  [UserRole.MANAGER]: [
    'manage:products',
    'manage:categories',
    'manage:inventory',
    'manage:orders',
    'manage:customers',
    'view:reports',
  ],
  [UserRole.CUSTOMER]: [
    'read:products',
    'manage:own_cart',
    'manage:own_orders',
    'manage:own_profile',
    'manage:own_wishlist',
  ],
};

export class AuthService {
  private readonly userRepository: UserRepository;
  private readonly sessionRepository: UserSessionRepository;

  constructor(
    userRepository: UserRepository = new UserRepository(),
    sessionRepository: UserSessionRepository = new UserSessionRepository(),
  ) {
    this.userRepository = userRepository;
    this.sessionRepository = sessionRepository;
  }

  public async register(input: RegisterInput): Promise<AuthSuccessResult> {
    // 1. Check existing user by email
    const existingEmailUser = await this.userRepository.findByEmail(input.email);
    if (existingEmailUser) {
      throw ApiError.conflict('An account with this email address already exists');
    }

    // 2. Check existing user by phone if provided
    if (input.phone) {
      const existingPhoneUser = await this.userRepository.findByPhone(input.phone);
      if (existingPhoneUser) {
        throw ApiError.conflict('An account with this phone number already exists');
      }
    }

    // 3. Hash password
    const passwordHash = await PasswordUtil.hash(input.password);

    // 4. Create Customer User
    const user = await this.userRepository.createCustomer({
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      passwordHash,
      phone: input.phone,
    });

    // 5. Generate Auth Tokens & Create Session
    const tokens = await this.createTokensAndSession(user);

    return {
      tokens,
      user: this.mapUserToResponse(user),
    };
  }

  public async login(
    input: LoginInput,
    metadata: { ipAddress?: string; userAgent?: string },
  ): Promise<AuthSuccessResult> {
    // 1. Find user by email
    const user = await this.userRepository.findByEmail(input.email);
    if (!user || !user.password) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    // 2. Check account status
    if (user.status === AccountStatus.SUSPENDED || user.status === AccountStatus.BLOCKED) {
      throw ApiError.forbidden(
        'Your account has been suspended or blocked. Please contact support',
      );
    }

    if (user.status === AccountStatus.DELETED) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    // 3. Compare password
    const isPasswordValid = await PasswordUtil.compare(input.password, user.password);
    if (!isPasswordValid) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    // 4. Update last login timestamp
    await this.userRepository.updateLastLogin(user.id);

    // 5. Generate Tokens & Persist User Session
    const tokens = await this.createTokensAndSession(user, metadata.ipAddress, metadata.userAgent);

    return {
      tokens,
      user: this.mapUserToResponse(user),
    };
  }

  public async refreshToken(
    refreshToken: string,
    metadata: { ipAddress?: string; userAgent?: string },
  ): Promise<AuthTokens> {
    if (!refreshToken) {
      throw ApiError.unauthorized('Refresh token is required');
    }

    // 1. Verify token signature & expiry
    JwtUtil.verifyRefreshToken(refreshToken);

    // 2. Validate session in DB
    const session = await this.sessionRepository.findByRefreshToken(refreshToken);
    if (!session || session.expiresAt < new Date()) {
      if (session) {
        await this.sessionRepository.deleteByRefreshToken(refreshToken);
      }
      throw ApiError.unauthorized('Invalid or expired refresh token session');
    }

    // 3. Check User status
    if (session.user.status !== AccountStatus.ACTIVE) {
      await this.sessionRepository.deleteByRefreshToken(refreshToken);
      throw ApiError.forbidden('User account is inactive');
    }

    // 4. Generate New Token Pair (Token Rotation)
    const newAccessToken = JwtUtil.generateAccessToken({
      id: session.user.id,
      email: session.user.email,
      role: session.user.role.name,
      roleId: session.user.roleId,
      firstName: session.user.firstName,
      lastName: session.user.lastName,
    });

    const newRefreshToken = JwtUtil.generateRefreshToken(session.user.id);

    // 5. Rotate session token in DB
    await this.sessionRepository.deleteByRefreshToken(refreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await this.sessionRepository.createSession({
      userId: session.user.id,
      refreshToken: newRefreshToken,
      ipAddress: metadata.ipAddress,
      userAgent: metadata.userAgent,
      expiresAt,
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  public async logout(refreshToken?: string, userId?: string): Promise<void> {
    if (refreshToken) {
      await this.sessionRepository.deleteByRefreshToken(refreshToken);
    } else if (userId) {
      await this.sessionRepository.deleteAllUserSessions(userId);
    }
  }

  public async getAuthenticatedUserContext(userId: string): Promise<UserContextResponse> {
    const user = await this.userRepository.findByIdWithRole(userId);
    if (!user) {
      throw ApiError.notFound('User context not found');
    }

    const mappedUser = this.mapUserToResponse(user);
    const roles: UserRole[] = [user.role.name];
    const permissions: string[] = ROLE_PERMISSIONS_MAP[user.role.name] || [];

    return {
      user: mappedUser,
      roles,
      permissions,
    };
  }

  private async createTokensAndSession(
    user: UserWithRole,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<AuthTokens> {
    const accessToken = JwtUtil.generateAccessToken({
      id: user.id,
      email: user.email,
      role: user.role.name,
      roleId: user.roleId,
      firstName: user.firstName,
      lastName: user.lastName,
    });

    const refreshToken = JwtUtil.generateRefreshToken(user.id);

    // 7 Days Session Expiry
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await this.sessionRepository.createSession({
      userId: user.id,
      refreshToken,
      ipAddress,
      userAgent,
      expiresAt,
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  private mapUserToResponse(user: UserWithRole | User): UserResponse {
    const roleName = 'role' in user ? user.role.name : ('CUSTOMER' as const);

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName,
      phone: user.phone,
      role: roleName,
      emailVerified: user.emailVerified,
      avatar: user.avatar,
      createdAt: user.createdAt,
    };
  }
}
