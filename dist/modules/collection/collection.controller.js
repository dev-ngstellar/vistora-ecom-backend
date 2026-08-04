"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollectionController = void 0;
const http_status_constant_1 = require("../../constants/http-status.constant");
const api_response_util_1 = require("../../utils/api-response.util");
const collection_service_1 = require("./collection.service");
class CollectionController {
    collectionService;
    constructor(collectionService = new collection_service_1.CollectionService()) {
        this.collectionService = collectionService;
    }
    createCollection = async (req, res) => {
        const collection = await this.collectionService.createCollection(req.body);
        return api_response_util_1.ApiResponseHandler.created(res, 'Collection created successfully', collection);
    };
    getCollection = async (req, res) => {
        const idOrSlug = req.params['idOrSlug'];
        const collection = await this.collectionService.getCollectionByIdOrSlug(idOrSlug);
        return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.OK, 'Collection retrieved successfully', collection);
    };
    listCollections = async (_req, res) => {
        const collections = await this.collectionService.listCollections();
        return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.OK, 'Collections retrieved successfully', collections);
    };
    updateCollection = async (req, res) => {
        const id = req.params['id'];
        const collection = await this.collectionService.updateCollection(id, req.body);
        return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.OK, 'Collection updated successfully', collection);
    };
    deleteCollection = async (req, res) => {
        const id = req.params['id'];
        await this.collectionService.deleteCollection(id);
        return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.OK, 'Collection soft-deleted successfully', null);
    };
}
exports.CollectionController = CollectionController;
