"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryController = void 0;
const http_status_constant_1 = require("../../constants/http-status.constant");
const api_response_util_1 = require("../../utils/api-response.util");
const inventory_service_1 = require("./inventory.service");
class InventoryController {
    inventoryService;
    constructor(inventoryService = new inventory_service_1.InventoryService()) {
        this.inventoryService = inventoryService;
    }
    getInventoryList = async (req, res) => {
        const filters = {
            q: req.query['q'],
            stockStatus: req.query['stockStatus'],
        };
        const items = await this.inventoryService.getInventoryList(filters);
        return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.OK, 'Inventory list retrieved successfully', items);
    };
    adjustStock = async (req, res) => {
        const updated = await this.inventoryService.adjustStock({
            ...req.body,
            userId: req.user?.id || 'System Admin',
        });
        return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.OK, 'Stock adjusted successfully', updated);
    };
}
exports.InventoryController = InventoryController;
