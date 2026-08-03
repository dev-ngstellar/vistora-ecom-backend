import { Prisma, UserSession } from '@prisma/client';
import { BaseRepository } from './base.repository';
import { UserWithRole } from './user.repository';

export type UserSessionWithUserRole = UserSession & {
  user: UserWithRole;
};

export class UserSessionRepository extends BaseRepository<UserSession, Prisma.UserSessionDelegate> {
  protected readonly model: Prisma.UserSessionDelegate;

  constructor() {
    super();
    this.model = this.prisma.userSession;
  }

  public async createSession(data: {
    userId: string;
    refreshToken: string;
    ipAddress?: string;
    userAgent?: string;
    expiresAt: Date;
  }): Promise<UserSession> {
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

  public async findByRefreshToken(refreshToken: string): Promise<UserSessionWithUserRole | null> {
    return this.prisma.userSession.findFirst({
      where: { refreshToken },
      include: {
        user: {
          include: {
            role: true,
          },
        },
      },
    }) as Promise<UserSessionWithUserRole | null>;
  }

  public async deleteByRefreshToken(refreshToken: string): Promise<Prisma.BatchPayload> {
    return this.prisma.userSession.deleteMany({
      where: { refreshToken },
    });
  }

  public async deleteAllUserSessions(userId: string): Promise<Prisma.BatchPayload> {
    return this.prisma.userSession.deleteMany({
      where: { userId },
    });
  }
}
