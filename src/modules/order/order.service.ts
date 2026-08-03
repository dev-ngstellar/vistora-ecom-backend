import { OrderStatus } from '@prisma/client';
import { OrderQueryFilters, OrderRepository } from '../../repositories/order.repository';
import { ApiError } from '../../utils/api-error.util';

export class OrderService {
  private orderRepository: OrderRepository;

  constructor() {
    this.orderRepository = new OrderRepository();
  }

  public async getOrders(filters: OrderQueryFilters) {
    return this.orderRepository.findOrders(filters);
  }

  public async getOrderById(id: string) {
    const order = await this.orderRepository.findOrderById(id);
    if (!order) {
      throw ApiError.notFound('Order not found');
    }
    return order;
  }

  public async updateOrderStatus(id: string, status: OrderStatus, remarks?: string, updatedBy?: string) {
    const existing = await this.orderRepository.findOrderById(id);
    if (!existing) {
      throw ApiError.notFound('Order not found');
    }
    return this.orderRepository.updateOrderStatus(id, status, remarks, updatedBy);
  }

  public async cancelOrder(id: string, reason?: string, updatedBy?: string) {
    const existing = await this.orderRepository.findOrderById(id);
    if (!existing) {
      throw ApiError.notFound('Order not found');
    }
    if (existing.status === OrderStatus.DELIVERED) {
      throw ApiError.badRequest('Delivered orders cannot be cancelled');
    }
    return this.orderRepository.cancelOrder(id, reason, updatedBy);
  }

  public async getInvoice(orderId: string) {
    return this.orderRepository.ensureInvoice(orderId);
  }

  public async getOrderStats() {
    return this.orderRepository.getOrderStats();
  }

  public async exportOrdersCsv(filters: OrderQueryFilters) {
    const { orders } = await this.orderRepository.findOrders({ ...filters, limit: 10000 });
    const headers = ['Order Number', 'Date', 'Customer Name', 'Email', 'Status', 'Payment Status', 'Total Amount', 'Items Count'];
    const rows = orders.map((o) => [
      o.orderNumber,
      new Date(o.createdAt).toISOString(),
      `"${o.user?.fullName || ''}"`,
      o.user?.email || '',
      o.status,
      o.payments[0]?.status || 'PENDING',
      o.total,
      o.items.length,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    return csvContent;
  }
}
