import { Request, Response } from 'express';
import { OrderStatus, PaymentStatus, ShipmentStatus } from '@prisma/client';
import { HTTP_STATUS } from '../../constants/http-status.constant';
import { ApiResponseHandler } from '../../utils/api-response.util';
import { OrderService } from './order.service';

export class OrderController {
  private orderService: OrderService;

  constructor() {
    this.orderService = new OrderService();
  }

  public getOrders = async (req: Request, res: Response): Promise<Response> => {
    const filters = {
      search: req.query.search as string,
      status: req.query.status as OrderStatus,
      paymentStatus: req.query.paymentStatus as PaymentStatus,
      shipmentStatus: req.query.shipmentStatus as ShipmentStatus,
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
      page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 10,
    };

    const result = await this.orderService.getOrders(filters);
    return ApiResponseHandler.success(res, HTTP_STATUS.OK, 'Orders retrieved successfully', result.orders, result.meta);
  };

  public getOrderById = async (req: Request, res: Response): Promise<Response> => {
    const id = req.params['id'] as string;
    const order = await this.orderService.getOrderById(id);
    return ApiResponseHandler.success(res, HTTP_STATUS.OK, 'Order retrieved successfully', order);
  };

  public updateOrderStatus = async (req: Request, res: Response): Promise<Response> => {
    const id = req.params['id'] as string;
    const { status, remarks } = req.body;
    const updatedBy = (req.user as any)?.email || 'Store Manager';

    const order = await this.orderService.updateOrderStatus(id, status, remarks, updatedBy);
    return ApiResponseHandler.success(res, HTTP_STATUS.OK, 'Order status updated successfully', order);
  };

  public cancelOrder = async (req: Request, res: Response): Promise<Response> => {
    const id = req.params['id'] as string;
    const { reason } = req.body;
    const updatedBy = (req.user as any)?.email || 'Store Manager';

    const order = await this.orderService.cancelOrder(id, reason, updatedBy);
    return ApiResponseHandler.success(res, HTTP_STATUS.OK, 'Order cancelled successfully', order);
  };

  public getInvoice = async (req: Request, res: Response): Promise<Response> => {
    const id = req.params['id'] as string;
    const invoice = await this.orderService.getInvoice(id);
    return ApiResponseHandler.success(res, HTTP_STATUS.OK, 'Invoice retrieved successfully', invoice);
  };

  public getOrderStats = async (_req: Request, res: Response): Promise<Response> => {
    const stats = await this.orderService.getOrderStats();
    return ApiResponseHandler.success(res, HTTP_STATUS.OK, 'Order statistics retrieved successfully', stats);
  };

  public exportOrdersCsv = async (req: Request, res: Response): Promise<void> => {
    const filters = {
      search: req.query.search as string,
      status: req.query.status as OrderStatus,
      paymentStatus: req.query.paymentStatus as PaymentStatus,
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
    };

    const csvContent = await this.orderService.exportOrdersCsv(filters);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="orders-export.csv"');
    res.status(200).send(csvContent);
  };

  // ==================== CUSTOMER ORDER HANDLERS ====================
  public createCustomerOrder = async (req: Request, res: Response): Promise<Response> => {
    const userId = req.user?.id;
    if (!userId) return ApiResponseHandler.error(res, HTTP_STATUS.UNAUTHORIZED, 'Authentication required');

    const order = await this.orderService.createCustomerOrder(userId, req.body);
    return ApiResponseHandler.success(res, HTTP_STATUS.CREATED, 'Order placed successfully', order);
  };

  public verifyPayment = async (req: Request, res: Response): Promise<Response> => {
    const result = await this.orderService.verifyPayment(req.body);
    return ApiResponseHandler.success(res, HTTP_STATUS.OK, 'Payment verified successfully', result);
  };
}
