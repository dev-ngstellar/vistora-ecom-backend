import { Router } from 'express';
import { adminUserRouter } from '../modules/admin-user/admin-user.routes';
import { authRouter } from '../modules/auth/auth.routes';
import { bannerRouter } from '../modules/banner/banner.routes';
import { brandRouter } from '../modules/brand/brand.routes';
import { cartRouter } from '../modules/cart/cart.routes';
import { categoryRouter } from '../modules/category/category.routes';
import { cmsRouter } from '../modules/cms/cms.routes';
import { collectionRouter } from '../modules/collection/collection.routes';
import { couponRouter } from '../modules/coupon/coupon.routes';
import { customerRouter } from '../modules/customer/customer.routes';
import { dashboardRouter } from '../modules/dashboard/dashboard.routes';
import { healthRouter } from '../modules/health/health.routes';
import { notificationRouter } from '../modules/notification/notification.routes';
import { orderRouter } from '../modules/order/order.routes';
import { productRouter } from '../modules/product/product.routes';
import { reportRouter } from '../modules/report/report.routes';
import { reviewRouter } from '../modules/review/review.routes';
import { roleRouter } from '../modules/role/role.routes';
import { shippingRouter } from '../modules/shipping/shipping.routes';
import { wishlistRouter } from '../modules/wishlist/wishlist.routes';
import { shippingConfigRouter } from '../modules/config/shipping-config.routes';
import { paymentConfigRouter } from '../modules/config/payment-config.routes';
import { notificationConfigRouter } from '../modules/config/notification-config.routes';
import { integrationRouter } from '../modules/config/integration.routes';
import { settingsRouter } from '../modules/config/settings.routes';

const apiRouter = Router();

// Mount module routes
apiRouter.use(healthRouter);
apiRouter.use(authRouter);
apiRouter.use(notificationRouter);
apiRouter.use(dashboardRouter);
apiRouter.use(categoryRouter);
apiRouter.use(brandRouter);
apiRouter.use(collectionRouter);
apiRouter.use(productRouter);
apiRouter.use(cartRouter);
apiRouter.use(wishlistRouter);
apiRouter.use(couponRouter);
apiRouter.use(orderRouter);
apiRouter.use(customerRouter);
apiRouter.use(reviewRouter);
apiRouter.use(bannerRouter);
apiRouter.use(cmsRouter);
apiRouter.use(roleRouter);
apiRouter.use(adminUserRouter);
apiRouter.use(reportRouter);
apiRouter.use(shippingRouter);

// Mount enterprise configuration routes
apiRouter.use('/config/shipping', shippingConfigRouter);
apiRouter.use('/config/payments', paymentConfigRouter);
apiRouter.use('/config/notifications', notificationConfigRouter);
apiRouter.use('/integrations', integrationRouter);
apiRouter.use('/settings', settingsRouter);

export { apiRouter };
