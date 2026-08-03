import { Request, Response } from 'express';
import { HTTP_STATUS } from '../../constants/http-status.constant';
import { ApiResponseHandler } from '../../utils/api-response.util';
import { RoleService } from './role.service';

export class RoleController {
  private roleService: RoleService;

  constructor() {
    this.roleService = new RoleService();
  }

  public getAllRoles = async (_req: Request, res: Response): Promise<Response> => {
    const roles = await this.roleService.getAllRoles();
    return ApiResponseHandler.success(res, HTTP_STATUS.OK, 'Roles retrieved successfully', roles);
  };

  public getRoleById = async (req: Request, res: Response): Promise<Response> => {
    const id = req.params['id'] as string;
    const role = await this.roleService.getRoleById(id);
    return ApiResponseHandler.success(res, HTTP_STATUS.OK, 'Role retrieved successfully', role);
  };

  public createRole = async (req: Request, res: Response): Promise<Response> => {
    const role = await this.roleService.createRole(req.body);
    return ApiResponseHandler.created(res, 'Role created successfully', role);
  };

  public updateRole = async (req: Request, res: Response): Promise<Response> => {
    const id = req.params['id'] as string;
    const role = await this.roleService.updateRole(id, req.body);
    return ApiResponseHandler.success(res, HTTP_STATUS.OK, 'Role updated successfully', role);
  };

  public getRoleStats = async (_req: Request, res: Response): Promise<Response> => {
    const stats = await this.roleService.getRoleStats();
    return ApiResponseHandler.success(res, HTTP_STATUS.OK, 'Role statistics retrieved successfully', stats);
  };
}
