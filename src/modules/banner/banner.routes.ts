import { UserRole } from '@prisma/client';
import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRoles } from '../../middleware/rbac.middleware';
import { asyncHandler } from '../../utils/async-handler.util';
import { BannerController } from './banner.controller';

const bannerRouter = Router();
const bannerController = new BannerController();

bannerRouter.get('/banners/public', asyncHandler(bannerController.getActivePublicBanners));
bannerRouter.get('/banners', asyncHandler(bannerController.getBanners));
bannerRouter.get('/banners/:id', asyncHandler(bannerController.getBannerById));
bannerRouter.post(
  '/banners',
  authenticate,
  requireRoles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  asyncHandler(bannerController.createBanner),
);
bannerRouter.put(
  '/banners/:id',
  authenticate,
  requireRoles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  asyncHandler(bannerController.updateBanner),
);
bannerRouter.patch(
  '/banners/:id/status',
  authenticate,
  requireRoles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  asyncHandler(bannerController.toggleActiveStatus),
);
bannerRouter.delete(
  '/banners/:id',
  authenticate,
  requireRoles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  asyncHandler(bannerController.deleteBanner),
);


export { bannerRouter };
