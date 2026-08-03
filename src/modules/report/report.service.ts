import { ReportRepository } from '../../repositories/report.repository';

export class ReportService {
  private reportRepository: ReportRepository;

  constructor() {
    this.reportRepository = new ReportRepository();
  }

  public async getSalesReport(startDate?: string, endDate?: string) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.reportRepository.getSalesReport(start, end);
  }

  public async getOrderReport(startDate?: string, endDate?: string) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.reportRepository.getOrderReport(start, end);
  }

  public async getProductReport() {
    return this.reportRepository.getProductReport();
  }

  public async getCustomerReport() {
    return this.reportRepository.getCustomerReport();
  }

  public async getInventoryReport() {
    return this.reportRepository.getInventoryReport();
  }

  public async getCouponReport() {
    return this.reportRepository.getCouponReport();
  }

  public async getReviewReport() {
    return this.reportRepository.getReviewReport();
  }

  public async getDashboardAnalytics(startDate?: string, endDate?: string) {
    const [sales, orders, products, customers, inventory, coupons, reviews] = await Promise.all([
      this.getSalesReport(startDate, endDate),
      this.getOrderReport(startDate, endDate),
      this.getProductReport(),
      this.getCustomerReport(),
      this.getInventoryReport(),
      this.getCouponReport(),
      this.getReviewReport(),
    ]);

    return {
      sales,
      orders,
      products,
      customers,
      inventory,
      coupons,
      reviews,
    };
  }
}
