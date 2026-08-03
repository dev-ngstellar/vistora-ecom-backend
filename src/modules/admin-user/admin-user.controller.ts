import { Request, Response } from 'express';
import { AccountStatus, UserRole } from '@prisma/client';
import { HTTP_STATUS } from '../../constants/http-status.constant';
import { ApiResponseHandler } from '../../utils/api-response.util';
import { AdminUserService } from './admin-user.service';

export class AdminUserController {
  private adminUserService: AdminUserService;

  constructor() {
    this.adminUserService = new AdminUserService();
  }

  public getAdminUsers = async (req: Request, res: Response): Promise<Response> => {
    const filters = {
      search: req.query.search as string,
      roleName: req.query.roleName as UserRole,
      status: req.query.status as AccountStatus,
      page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 10,
    };

    const result = await this.adminUserService.getAdminUsers(filters);
    return ApiResponseHandler.success(res, HTTP_STATUS.OK, 'Admin users retrieved successfully', result.users, result.meta);
  };

  public getAdminUserById = async (req: Request, res: Response): Promise<Response> => {
    const id = req.params['id'] as string;
    const user = await this.adminUserService.getAdminUserById(id);
    return ApiResponseHandler.success(res, HTTP_STATUS.OK, 'User retrieved successfully', user);
  };

  public createStaffUser = async (req: Request, res: Response): Promise<Response> => {
    const user = await this.adminUserService.createStaffUser(req.body);
    return ApiResponseHandler.created(res, 'Staff user created successfully', user);
  };

  public updateStaffUser = async (req: Request, res: Response): Promise<Response> => {
    const id = req.params['id'] as string;
    const user = await this.adminUserService.updateStaffUser(id, req.body);
    return ApiResponseHandler.success(res, HTTP_STATUS.OK, 'Staff user updated successfully', user);
  };

  public updateAccountStatus = async (req: Request, res: Response): Promise<Response> => {
    const id = req.params['id'] as string;
    const { status } = req.body;
    const updated = await this.adminUserService.updateAccountStatus(id, status);
    return ApiResponseHandler.success(res, HTTP_STATUS.OK, 'Account status updated successfully', updated);
  };

  public resetPassword = async (req: Request, res: Response): Promise<Response> => {
    const id = req.params['id'] as string;
    const { password } = req.body;
    await this.adminUserService.resetPassword(id, password);
    return ApiResponseHandler.success(res, HTTP_STATUS.OK, 'Password reset successfully', null);
  };

  public getUserStats = async (_req: Request, res: Response): Promise<Response> => {
    const stats = await this.adminUserService.getUserStats();
    return ApiResponseHandler.success(res, HTTP_STATUS.OK, 'User statistics retrieved successfully', stats);
  };
}
