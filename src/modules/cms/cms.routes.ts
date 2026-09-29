import { UserRole } from '@prisma/client';
import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRoles } from '../../middleware/rbac.middleware';
import { asyncHandler } from '../../utils/async-handler.util';
import { CMSController } from './cms.controller';

const cmsRouter = Router();
const cmsController = new CMSController();

cmsRouter.get('/cms-pages/public/:slug', asyncHandler(cmsController.getPublicPageBySlug));
cmsRouter.get('/cms-pages', asyncHandler(cmsController.getPages));
cmsRouter.get('/cms-pages/:id', asyncHandler(cmsController.getPageById));
cmsRouter.post(
  '/cms-pages',
  authenticate,
  requireRoles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  asyncHandler(cmsController.createPage),
);
cmsRouter.put(
  '/cms-pages/:id',
  authenticate,
  requireRoles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  asyncHandler(cmsController.updatePage),
);
cmsRouter.patch(
  '/cms-pages/:id/status',
  authenticate,
  requireRoles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  asyncHandler(cmsController.updateStatus),
);
cmsRouter.delete(
  '/cms-pages/:id',
  authenticate,
  requireRoles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  asyncHandler(cmsController.deletePage),
);


export { cmsRouter };
