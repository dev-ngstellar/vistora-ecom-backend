import { UserRole } from '@prisma/client';

export interface RegisterInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RefreshTokenInput {
  refreshToken?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface UserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string | null;
  phone: string | null;
  role: UserRole;
  emailVerified: boolean;
  avatar: string | null;
  createdAt: Date;
}

export interface UserContextResponse {
  user: UserResponse;
  roles: UserRole[];
  permissions: string[];
}

export interface AuthSuccessResult {
  tokens: AuthTokens;
  user: UserResponse;
}
