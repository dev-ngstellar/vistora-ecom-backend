export interface DashboardSummaryResponse {
  totalSales: number;
  totalOrders: number;
  pendingOrders: number;
  totalCustomers: number;
  newCustomersToday: number;
  totalProducts: number;
  lowStockCount: number;
  currency: string;
}
