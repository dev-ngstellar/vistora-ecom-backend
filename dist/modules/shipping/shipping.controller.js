"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShippingController = void 0;
const http_status_constant_1 = require("../../constants/http-status.constant");
const api_response_util_1 = require("../../utils/api-response.util");
const shipping_service_1 = require("./shipping.service");
class ShippingController {
    shippingService;
    constructor(shippingService = new shipping_service_1.ShippingService()) {
        this.shippingService = shippingService;
    }
    estimateShipping = async (req, res) => {
        const { subtotal, postalCode, country } = req.body;
        const estimate = await this.shippingService.estimateShipping({
            subtotal: Number(subtotal) || 0,
            postalCode,
            country,
        });
        return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.OK, 'Shipping rates estimated successfully', estimate);
    };
}
exports.ShippingController = ShippingController;
