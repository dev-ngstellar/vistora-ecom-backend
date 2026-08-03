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
