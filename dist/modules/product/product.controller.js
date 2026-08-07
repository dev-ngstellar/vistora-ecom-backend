"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductController = void 0;
const http_status_constant_1 = require("../../constants/http-status.constant");
const api_response_util_1 = require("../../utils/api-response.util");
const product_service_1 = require("./product.service");
class ProductController {
    productService;
    constructor(productService = new product_service_1.ProductService()) {
        this.productService = productService;
    }
    createProduct = async (req, res) => {
        const product = await this.productService.createProduct(req.body);
        return api_response_util_1.ApiResponseHandler.created(res, 'Product created successfully', product);
    };
    getProduct = async (req, res) => {
        const idOrSlug = req.params['idOrSlug'];
        const product = await this.productService.getProductByIdOrSlug(idOrSlug);
        return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.OK, 'Product retrieved successfully', product);
    };
    listProducts = async (req, res) => {
        const filters = {
            q: req.query['q'],
            categoryId: req.query['categoryId'],
            brandId: req.query['brandId'],
            collectionId: req.query['collectionId'],
            minPrice: req.query['minPrice'] ? Number(req.query['minPrice']) : undefined,
            maxPrice: req.query['maxPrice'] ? Number(req.query['maxPrice']) : undefined,
            status: req.query['status'],
            featured: req.query['featured'] !== undefined ? req.query['featured'] === 'true' : undefined,
            visibility: req.query['visibility'],
            page: req.query['page'] ? Number(req.query['page']) : 1,
            limit: req.query['limit'] ? Number(req.query['limit']) : 12,
            sort: req.query['sort'],
        };
        const result = await this.productService.searchAndFilterProducts(filters);
        return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.OK, 'Products retrieved successfully', result.products, {
            total: result.total,
            page: result.page,
            limit: result.limit,
            totalPages: result.totalPages,
        });
    };
    updateProduct = async (req, res) => {
        const id = req.params['id'];
        const product = await this.productService.updateProduct(id, req.body);
        return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.OK, 'Product updated successfully', product);
    };
    deleteProduct = async (req, res) => {
        const id = req.params['id'];
        await this.productService.deleteProduct(id);
        return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.OK, 'Product soft-deleted successfully', null);
    };
    addProductImage = async (req, res) => {
        const productId = req.params['productId'];
        const image = await this.productService.addProductImage(productId, req.body);
        return api_response_util_1.ApiResponseHandler.created(res, 'Product image added successfully', image);
    };
    deleteProductImage = async (req, res) => {
        const imageId = req.params['imageId'];
        await this.productService.deleteProductImage(imageId);
        return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.OK, 'Product image removed successfully', null);
    };
    addProductVariant = async (req, res) => {
        const productId = req.params['productId'];
        const variant = await this.productService.addProductVariant(productId, req.body);
        return api_response_util_1.ApiResponseHandler.created(res, 'Product variant added successfully', variant);
    };
    deleteProductVariant = async (req, res) => {
        const variantId = req.params['variantId'];
        await this.productService.deleteProductVariant(variantId);
        return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.OK, 'Product variant removed successfully', null);
    };
    bulkAction = async (req, res) => {
        const { action, productIds, targetId } = req.body;
        const affectedCount = await this.productService.bulkAction(action, productIds, targetId);
        return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.OK, `Bulk action '${action}' completed successfully`, { affectedCount });
    };
}
exports.ProductController = ProductController;
