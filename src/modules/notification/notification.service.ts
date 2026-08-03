import { NotificationCountResponse } from './notification.types';

export class NotificationService {
  public async getNotificationCount(_userId: string): Promise<NotificationCountResponse> {
    // Return structured notification statistics (ready for Prisma DB querying)
    return {
      unreadCount: 3,
      totalCount: 12,
      categories: {
        order: 1,
        inventory: 1,
        customer: 1,
        system: 0,
      },
    };
  }
}
