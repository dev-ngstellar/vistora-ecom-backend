import { Request, Response } from 'express';
import { AccountStatus } from '@prisma/client';
import { HTTP_STATUS } from '../../constants/http-status.constant';
import { ApiResponseHandler } from '../../utils/api-response.util';
import { CustomerService } from './customer.service';

export class CustomerController {
  private customerService: CustomerService;

  constructor() {
    this.customerService = new CustomerService();
  }

  public getCustomers = async (req: Request, res: Response): Promise<Response> => {
    const filters = {
      search: req.query.search as string,
      status: req.query.status as AccountStatus,
      page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 10,
    };

    const result = await this.customerService.getCustomers(filters);
    return ApiResponseHandler.success(res, HTTP_STATUS.OK, 'Customers retrieved successfully', result.customers, result.meta);
  };

  public getCustomerDetails = async (req: Request, res: Response): Promise<Response> => {
    const id = req.params['id'] as string;
    const details = await this.customerService.getCustomerDetails(id);
    return ApiResponseHandler.success(res, HTTP_STATUS.OK, 'Customer details retrieved successfully', details);
  };

  public updateCustomerStatus = async (req: Request, res: Response): Promise<Response> => {
    const id = req.params['id'] as string;
    const { status } = req.body;

    const updated = await this.customerService.updateCustomerStatus(id, status);
    return ApiResponseHandler.success(res, HTTP_STATUS.OK, 'Customer status updated successfully', updated);
  };

  public getCustomerStats = async (_req: Request, res: Response): Promise<Response> => {
    const stats = await this.customerService.getCustomerStats();
    return ApiResponseHandler.success(res, HTTP_STATUS.OK, 'Customer statistics retrieved successfully', stats);
  };

  // ==================== ADDRESS HANDLERS ====================
  public getMyAddresses = async (req: Request, res: Response): Promise<Response> => {
    const userId = req.user?.id;
    if (!userId) return ApiResponseHandler.error(res, HTTP_STATUS.UNAUTHORIZED, 'User authentication required');
    const addresses = await this.customerService.getMyAddresses(userId);
    return ApiResponseHandler.success(res, HTTP_STATUS.OK, 'Addresses retrieved successfully', addresses);
  };

  public createAddress = async (req: Request, res: Response): Promise<Response> => {
    const userId = req.user?.id;
    if (!userId) return ApiResponseHandler.error(res, HTTP_STATUS.UNAUTHORIZED, 'User authentication required');
    const address = await this.customerService.createAddress(userId, req.body);
    return ApiResponseHandler.success(res, HTTP_STATUS.CREATED, 'Address created successfully', address);
  };

  public updateAddress = async (req: Request, res: Response): Promise<Response> => {
    const userId = req.user?.id;
    const addressId = req.params['id'] as string;
    if (!userId) return ApiResponseHandler.error(res, HTTP_STATUS.UNAUTHORIZED, 'User authentication required');
    const updated = await this.customerService.updateAddress(userId, addressId, req.body);
    return ApiResponseHandler.success(res, HTTP_STATUS.OK, 'Address updated successfully', updated);
  };

  public deleteAddress = async (req: Request, res: Response): Promise<Response> => {
    const userId = req.user?.id;
    const addressId = req.params['id'] as string;
    if (!userId) return ApiResponseHandler.error(res, HTTP_STATUS.UNAUTHORIZED, 'User authentication required');
    await this.customerService.deleteAddress(userId, addressId);
    return ApiResponseHandler.success(res, HTTP_STATUS.OK, 'Address deleted successfully', null);
  };
}
