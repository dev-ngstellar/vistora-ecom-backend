"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const validate_middleware_1 = require("../../middleware/validate.middleware");
const async_handler_util_1 = require("../../utils/async-handler.util");
const auth_controller_1 = require("./auth.controller");
const auth_validation_1 = require("./auth.validation");
const authRouter = (0, express_1.Router)();
exports.authRouter = authRouter;
const authController = new auth_controller_1.AuthController();
/**
 * @openapi
 * /auth/register:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Register a new customer account
 *     description: Creates a new user record with CUSTOMER role and returns access/refresh tokens.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - password
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: John
 *               lastName:
 *                 type: string
 *                 example: Doe
 *               email:
 *                 type: string
 *                 example: john.doe@example.com
 *               password:
 *                 type: string
 *                 example: Password@123
 *               phone:
 *                 type: string
 *                 example: "9876543210"
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation failed
 *       409:
 *         description: Email or phone already registered
 */
authRouter.post('/auth/register', (0, validate_middleware_1.validateRequest)(auth_validation_1.registerSchema), (0, async_handler_util_1.asyncHandler)(authController.register));
/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Customer and Staff user login
 *     description: Authenticates user credentials and issues access & refresh tokens.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: john.doe@example.com
 *               password:
 *                 type: string
 *                 example: Password@123
 *     responses:
 *       200:
 *         description: Authentication successful
 *       401:
 *         description: Invalid credentials
 *       403:
 *         description: Account suspended or blocked
 */
authRouter.post('/auth/login', (0, validate_middleware_1.validateRequest)(auth_validation_1.loginSchema), (0, async_handler_util_1.asyncHandler)(authController.login));
/**
 * @openapi
 * /auth/refresh:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Refresh Access Token
 *     description: Rotates refresh token and generates a new access token.
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token refresh successful
 *       401:
 *         description: Invalid or expired refresh token
 */
authRouter.post('/auth/refresh', (0, validate_middleware_1.validateRequest)(auth_validation_1.refreshTokenSchema), (0, async_handler_util_1.asyncHandler)(authController.refreshToken));
/**
 * @openapi
 * /auth/logout:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: User logout
 *     description: Invalidates active refresh token session and clears HTTP cookies.
 *     responses:
 *       200:
 *         description: Logout successful
 */
authRouter.post('/auth/logout', (0, async_handler_util_1.asyncHandler)(authController.logout));
/**
 * @openapi
 * /auth/me:
 *   get:
 *     tags:
 *       - Authentication
 *     summary: Get current authenticated user context
 *     description: Returns authenticated user profile along with role list and assigned permission matrix.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current authenticated user context retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Current authenticated user context retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         email:
 *                           type: string
 *                         firstName:
 *                           type: string
 *                         lastName:
 *                           type: string
 *                         fullName:
 *                           type: string
 *                         phone:
 *                           type: string
 *                         role:
 *                           type: string
 *                         emailVerified:
 *                           type: boolean
 *                         avatar:
 *                           type: string
 *                     roles:
 *                       type: array
 *                       items:
 *                         type: string
 *                     permissions:
 *                       type: array
 *                       items:
 *                         type: string
 *       401:
 *         description: Unauthorized - Authentication required
 */
authRouter.get('/auth/me', auth_middleware_1.authenticate, (0, async_handler_util_1.asyncHandler)(authController.getCurrentUser));
