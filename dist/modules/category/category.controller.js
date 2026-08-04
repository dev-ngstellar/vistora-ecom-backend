"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryController = void 0;
const http_status_constant_1 = require("../../constants/http-status.constant");
const api_response_util_1 = require("../../utils/api-response.util");
const category_service_1 = require("./category.service");
class CategoryController {
    categoryService;
    constructor(categoryService = new category_service_1.CategoryService()) {
        this.categoryService = categoryService;
    }
    createCategory = async (req, res) => {
        const category = await this.categoryService.createCategory(req.body);
        return api_response_util_1.ApiResponseHandler.created(res, 'Category created successfully', category);
    };
    getCategory = async (req, res) => {
        const idOrSlug = req.params['idOrSlug'];
        const category = await this.categoryService.getCategoryByIdOrSlug(idOrSlug);
        return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.OK, 'Category retrieved successfully', category);
    };
    listCategories = async (_req, res) => {
        const categories = await this.categoryService.listCategories();
        return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.OK, 'Categories retrieved successfully', categories);
    };
    getCategoryTree = async (_req, res) => {
        const tree = await this.categoryService.getCategoryTree();
        return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.OK, 'Category hierarchy tree retrieved successfully', tree);
    };
    updateCategory = async (req, res) => {
        const id = req.params['id'];
        const category = await this.categoryService.updateCategory(id, req.body);
        return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.OK, 'Category updated successfully', category);
    };
    deleteCategory = async (req, res) => {
        const id = req.params['id'];
        await this.categoryService.deleteCategory(id);
        return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.OK, 'Category soft-deleted successfully', null);
    };
}
exports.CategoryController = CategoryController;
