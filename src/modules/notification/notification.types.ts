export interface NotificationCategoryCounts {
  order: number;
  inventory: number;
  customer: number;
  system: number;
}

export interface NotificationCountResponse {
  unreadCount: number;
  totalCount: number;
  categories: NotificationCategoryCounts;
}

export interface NotificationItemResponse {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  status: 'UNREAD' | 'READ';
  actionUrl: string | null;
  createdAt: Date | string;
  readAt: Date | string | null;
}

export interface NotificationListResponse {
  notifications: NotificationItemResponse[];
  unreadCount: number;
  totalCount: number;
}
