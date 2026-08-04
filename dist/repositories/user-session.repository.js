"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserSessionRepository = void 0;
const base_repository_1 = require("./base.repository");
class UserSessionRepository extends base_repository_1.BaseRepository {
    model;
    constructor() {
        super();
        this.model = this.prisma.userSession;
    }
    async createSession(data) {
        return this.prisma.userSession.create({
            data: {
                userId: data.userId,
                refreshToken: data.refreshToken,
                ipAddress: data.ipAddress || null,
                userAgent: data.userAgent || null,
                expiresAt: data.expiresAt,
            },
        });
    }
    async findByRefreshToken(refreshToken) {
        return this.prisma.userSession.findFirst({
            where: { refreshToken },
            include: {
                user: {
                    include: {
                        role: true,
                    },
                },
            },
        });
    }
    async deleteByRefreshToken(refreshToken) {
        return this.prisma.userSession.deleteMany({
            where: { refreshToken },
        });
    }
    async deleteAllUserSessions(userId) {
        return this.prisma.userSession.deleteMany({
            where: { userId },
        });
    }
}
exports.UserSessionRepository = UserSessionRepository;
