import { Router } from 'express';
import { asyncHandler } from '../../utils/async-handler.util';
import { ShippingController } from './shipping.controller';

const shippingRouter = Router();
const shippingController = new ShippingController();

/**
 * @openapi
 * /shipping/estimate:
 *   post:
 *     tags:
 *       - Shipping
 *     summary: Estimate shipping methods, rates, and delivery ETA
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - subtotal
 *             properties:
 *               subtotal:
 *                 type: number
 *                 example: 180.00
 *               postalCode:
 *                 type: string
 *                 example: "10001"
 *               country:
 *                 type: string
 *                 example: USA
 *     responses:
 *       200:
 *         description: Shipping rates and methods estimated successfully
 */
shippingRouter.post('/shipping/estimate', asyncHandler(shippingController.estimateShipping));

export { shippingRouter };
