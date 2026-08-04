"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const client_1 = require("@prisma/client");
const repositories_1 = require("../../repositories");
const api_error_util_1 = require("../../utils/api-error.util");
const jwt_util_1 = require("../../utils/jwt.util");
const password_util_1 = require("../../utils/password.util");
const ROLE_PERMISSIONS_MAP = {
    [client_1.UserRole.SUPER_ADMIN]: ['*'],
    [client_1.UserRole.ADMIN]: [
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
    [client_1.UserRole.MANAGER]: [
        'manage:products',
        'manage:categories',
        'manage:inventory',
        'manage:orders',
        'manage:customers',
        'view:reports',
    ],
    [client_1.UserRole.CUSTOMER]: [
        'read:products',
        'manage:own_cart',
        'manage:own_orders',
        'manage:own_profile',
        'manage:own_wishlist',
    ],
};
class AuthService {
    userRepository;
    sessionRepository;
    constructor(userRepository = new repositories_1.UserRepository(), sessionRepository = new repositories_1.UserSessionRepository()) {
        this.userRepository = userRepository;
        this.sessionRepository = sessionRepository;
    }
    async register(input) {
        // 1. Check existing user by email
        const existingEmailUser = await this.userRepository.findByEmail(input.email);
        if (existingEmailUser) {
            throw api_error_util_1.ApiError.conflict('An account with this email address already exists');
        }
        // 2. Check existing user by phone if provided
        if (input.phone) {
            const existingPhoneUser = await this.userRepository.findByPhone(input.phone);
            if (existingPhoneUser) {
                throw api_error_util_1.ApiError.conflict('An account with this phone number already exists');
            }
        }
        // 3. Hash password
        const passwordHash = await password_util_1.PasswordUtil.hash(input.password);
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
    async login(input, metadata) {
        // 1. Find user by email
        const user = await this.userRepository.findByEmail(input.email);
        if (!user || !user.password) {
            throw api_error_util_1.ApiError.unauthorized('Invalid email or password');
        }
        // 2. Check account status
        if (user.status === client_1.AccountStatus.SUSPENDED || user.status === client_1.AccountStatus.BLOCKED) {
            throw api_error_util_1.ApiError.forbidden('Your account has been suspended or blocked. Please contact support');
        }
        if (user.status === client_1.AccountStatus.DELETED) {
            throw api_error_util_1.ApiError.unauthorized('Invalid email or password');
        }
        // 3. Compare password
        const isPasswordValid = await password_util_1.PasswordUtil.compare(input.password, user.password);
        if (!isPasswordValid) {
            throw api_error_util_1.ApiError.unauthorized('Invalid email or password');
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
    async refreshToken(refreshToken, metadata) {
        if (!refreshToken) {
            throw api_error_util_1.ApiError.unauthorized('Refresh token is required');
        }
        // 1. Verify token signature & expiry
        jwt_util_1.JwtUtil.verifyRefreshToken(refreshToken);
        // 2. Validate session in DB
        const session = await this.sessionRepository.findByRefreshToken(refreshToken);
        if (!session || session.expiresAt < new Date()) {
            if (session) {
                await this.sessionRepository.deleteByRefreshToken(refreshToken);
            }
            throw api_error_util_1.ApiError.unauthorized('Invalid or expired refresh token session');
        }
        // 3. Check User status
        if (session.user.status !== client_1.AccountStatus.ACTIVE) {
            await this.sessionRepository.deleteByRefreshToken(refreshToken);
            throw api_error_util_1.ApiError.forbidden('User account is inactive');
        }
        // 4. Generate New Token Pair (Token Rotation)
        const newAccessToken = jwt_util_1.JwtUtil.generateAccessToken({
            id: session.user.id,
            email: session.user.email,
            role: session.user.role.name,
            roleId: session.user.roleId,
            firstName: session.user.firstName,
            lastName: session.user.lastName,
        });
        const newRefreshToken = jwt_util_1.JwtUtil.generateRefreshToken(session.user.id);
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
    async logout(refreshToken, userId) {
        if (refreshToken) {
            await this.sessionRepository.deleteByRefreshToken(refreshToken);
        }
        else if (userId) {
            await this.sessionRepository.deleteAllUserSessions(userId);
        }
    }
    async getAuthenticatedUserContext(userId) {
        const user = await this.userRepository.findByIdWithRole(userId);
        if (!user) {
            throw api_error_util_1.ApiError.notFound('User context not found');
        }
        const mappedUser = this.mapUserToResponse(user);
        const roles = [user.role.name];
        const permissions = ROLE_PERMISSIONS_MAP[user.role.name] || [];
        return {
            user: mappedUser,
            roles,
            permissions,
        };
    }
    async createTokensAndSession(user, ipAddress, userAgent) {
        const accessToken = jwt_util_1.JwtUtil.generateAccessToken({
            id: user.id,
            email: user.email,
            role: user.role.name,
            roleId: user.roleId,
            firstName: user.firstName,
            lastName: user.lastName,
        });
        const refreshToken = jwt_util_1.JwtUtil.generateRefreshToken(user.id);
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
    mapUserToResponse(user) {
        const roleName = 'role' in user ? user.role.name : 'CUSTOMER';
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
exports.AuthService = AuthService;
