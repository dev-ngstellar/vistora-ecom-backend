"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shippingRouter = void 0;
const express_1 = require("express");
const async_handler_util_1 = require("../../utils/async-handler.util");
const shipping_controller_1 = require("./shipping.controller");
const shippingRouter = (0, express_1.Router)();
exports.shippingRouter = shippingRouter;
const shippingController = new shipping_controller_1.ShippingController();
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
shippingRouter.post('/shipping/estimate', (0, async_handler_util_1.asyncHandler)(shippingController.estimateShipping));
