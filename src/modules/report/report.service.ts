import { ReportRepository } from '../../repositories/report.repository';

export class ReportService {
  private reportRepository: ReportRepository;

  constructor() {
    this.reportRepository = new ReportRepository();
  }

  private parseDateRange(startDate?: string, endDate?: string) {
    let start: Date | undefined;
    let end: Date | undefined;

    if (startDate) {
      start = new Date(startDate);
      start.setUTCHours(0, 0, 0, 0);
    }

    if (endDate) {
      end = new Date(endDate);
      end.setUTCHours(23, 59, 59, 999);
    }

    return { start, end };
  }

  public async getSalesReport(startDate?: string, endDate?: string) {
    const { start, end } = this.parseDateRange(startDate, endDate);
    return this.reportRepository.getSalesReport(start, end);
  }

  public async getOrderReport(startDate?: string, endDate?: string) {
    const { start, end } = this.parseDateRange(startDate, endDate);
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
