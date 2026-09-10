"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadController = exports.uploadMiddleware = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const api_error_util_1 = require("../../utils/api-error.util");
const api_response_util_1 = require("../../utils/api-response.util");
const http_status_constant_1 = require("../../constants/http-status.constant");
const cloudinary_config_1 = require("../../config/cloudinary.config");
const env_config_1 = require("../../config/env.config");
const logger_config_1 = require("../../config/logger.config");
// Memory storage for fast buffering & direct streaming to Cloudinary
const memoryStorage = multer_1.default.memoryStorage();
const fileFilter = (_req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp|svg|gif|avif/;
    const extname = allowedTypes.test(path_1.default.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname || mimetype) {
        return cb(null, true);
    }
    cb(new api_error_util_1.ApiError(http_status_constant_1.HTTP_STATUS.BAD_REQUEST, 'Only image files (jpg, jpeg, png, webp, svg, gif, avif) are allowed'));
};
exports.uploadMiddleware = (0, multer_1.default)({
    storage: memoryStorage,
    fileFilter,
    limits: { fileSize: 15 * 1024 * 1024 }, // 15MB limit
});
const isCloudinaryReady = () => {
    return Boolean(env_config_1.env.CLOUDINARY_CLOUD_NAME && env_config_1.env.CLOUDINARY_API_KEY && env_config_1.env.CLOUDINARY_API_SECRET);
};
const uploadBufferToCloudinary = (fileBuffer, folder = 'vistora_store') => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary_config_1.cloudinary.uploader.upload_stream({
            folder,
            resource_type: 'auto',
        }, (error, result) => {
            if (error || !result) {
                logger_config_1.logger.error({ err: error }, 'Cloudinary upload error');
                return reject(error || new Error('Cloudinary upload failed'));
            }
            resolve({
                url: result.secure_url || result.url,
                publicId: result.public_id,
                format: result.format,
                bytes: result.bytes,
            });
        });
        uploadStream.end(fileBuffer);
    });
};
class UploadController {
    uploadSingle = async (req, res) => {
        if (!req.file) {
            throw api_error_util_1.ApiError.badRequest('No image file provided');
        }
        if (isCloudinaryReady()) {
            try {
                const result = await uploadBufferToCloudinary(req.file.buffer, 'vistora_products');
                return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.CREATED, 'Image uploaded to Cloudinary successfully', {
                    url: result.url,
                    filename: result.publicId,
                    originalName: req.file.originalname,
                    size: req.file.size,
                    mimeType: req.file.mimetype,
                    publicId: result.publicId,
                });
            }
            catch (err) {
                logger_config_1.logger.error({ err }, 'Failed uploading single file to Cloudinary, fallback to local storage');
            }
        }
        // Fallback: Local Disk Storage if Cloudinary is offline/unconfigured
        const uploadDir = path_1.default.join(process.cwd(), 'public', 'uploads');
        if (!fs_1.default.existsSync(uploadDir)) {
            fs_1.default.mkdirSync(uploadDir, { recursive: true });
        }
        const ext = path_1.default.extname(req.file.originalname).toLowerCase();
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const filename = `${req.file.fieldname}-${uniqueSuffix}${ext}`;
        const filePath = path_1.default.join(uploadDir, filename);
        fs_1.default.writeFileSync(filePath, req.file.buffer);
        const host = req.get('host') || 'localhost:4000';
        const protocol = req.protocol || 'http';
        const fileUrl = `${protocol}://${host}/uploads/${filename}`;
        return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.CREATED, 'Image uploaded locally successfully', {
            url: fileUrl,
            filename,
            originalName: req.file.originalname,
            size: req.file.size,
            mimeType: req.file.mimetype,
        });
    };
    uploadMultiple = async (req, res) => {
        const files = req.files;
        if (!files || files.length === 0) {
            throw api_error_util_1.ApiError.badRequest('No image files provided');
        }
        if (isCloudinaryReady()) {
            try {
                const uploadPromises = files.map(async (file) => {
                    const result = await uploadBufferToCloudinary(file.buffer, 'vistora_products');
                    return {
                        url: result.url,
                        filename: result.publicId,
                        originalName: file.originalname,
                        size: file.size,
                        mimeType: file.mimetype,
                        publicId: result.publicId,
                    };
                });
                const uploaded = await Promise.all(uploadPromises);
                return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.CREATED, 'Images uploaded to Cloudinary successfully', uploaded);
            }
            catch (err) {
                logger_config_1.logger.error({ err }, 'Failed uploading batch to Cloudinary, fallback to local storage');
            }
        }
        // Fallback: Local Disk Storage
        const uploadDir = path_1.default.join(process.cwd(), 'public', 'uploads');
        if (!fs_1.default.existsSync(uploadDir)) {
            fs_1.default.mkdirSync(uploadDir, { recursive: true });
        }
        const host = req.get('host') || 'localhost:4000';
        const protocol = req.protocol || 'http';
        const uploaded = files.map((file) => {
            const ext = path_1.default.extname(file.originalname).toLowerCase();
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            const filename = `${file.fieldname}-${uniqueSuffix}${ext}`;
            const filePath = path_1.default.join(uploadDir, filename);
            fs_1.default.writeFileSync(filePath, file.buffer);
            return {
                url: `${protocol}://${host}/uploads/${filename}`,
                filename,
                originalName: file.originalname,
                size: file.size,
                mimeType: file.mimetype,
            };
        });
        return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.CREATED, 'Images uploaded locally successfully', uploaded);
    };
}
exports.UploadController = UploadController;
