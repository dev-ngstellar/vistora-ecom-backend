"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerController = void 0;
const http_status_constant_1 = require("../../constants/http-status.constant");
const api_response_util_1 = require("../../utils/api-response.util");
const customer_service_1 = require("./customer.service");
class CustomerController {
    customerService;
    constructor() {
        this.customerService = new customer_service_1.CustomerService();
    }
    getCustomers = async (req, res) => {
        const filters = {
            search: req.query.search,
            status: req.query.status,
            page: req.query.page ? parseInt(req.query.page, 10) : 1,
            limit: req.query.limit ? parseInt(req.query.limit, 10) : 10,
        };
        const result = await this.customerService.getCustomers(filters);
        return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.OK, 'Customers retrieved successfully', result.customers, result.meta);
    };
    getCustomerDetails = async (req, res) => {
        const id = req.params['id'];
        const details = await this.customerService.getCustomerDetails(id);
        return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.OK, 'Customer details retrieved successfully', details);
    };
    updateCustomerStatus = async (req, res) => {
        const id = req.params['id'];
        const { status } = req.body;
        const updated = await this.customerService.updateCustomerStatus(id, status);
        return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.OK, 'Customer status updated successfully', updated);
    };
    getCustomerStats = async (_req, res) => {
        const stats = await this.customerService.getCustomerStats();
        return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.OK, 'Customer statistics retrieved successfully', stats);
    };
}
exports.CustomerController = CustomerController;
