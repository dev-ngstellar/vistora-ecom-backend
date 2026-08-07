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
const uploadDir = path_1.default.join(process.cwd(), 'public', 'uploads');
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
}
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, uploadDir);
    },
    filename: (_req, file, cb) => {
        const ext = path_1.default.extname(file.originalname).toLowerCase();
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    },
});
const fileFilter = (_req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp|svg|gif/;
    const extname = allowedTypes.test(path_1.default.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
        return cb(null, true);
    }
    cb(new api_error_util_1.ApiError(http_status_constant_1.HTTP_STATUS.BAD_REQUEST, 'Only image files (jpg, jpeg, png, webp, svg, gif) are allowed'));
};
exports.uploadMiddleware = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});
class UploadController {
    uploadSingle = async (req, res) => {
        if (!req.file) {
            throw api_error_util_1.ApiError.badRequest('No image file provided');
        }
        const host = req.get('host') || 'localhost:4000';
        const protocol = req.protocol || 'http';
        const fileUrl = `${protocol}://${host}/uploads/${req.file.filename}`;
        return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.CREATED, 'Image uploaded successfully', {
            url: fileUrl,
            filename: req.file.filename,
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
        const host = req.get('host') || 'localhost:4000';
        const protocol = req.protocol || 'http';
        const uploaded = files.map((file) => ({
            url: `${protocol}://${host}/uploads/${file.filename}`,
            filename: file.filename,
            originalName: file.originalname,
            size: file.size,
            mimeType: file.mimetype,
        }));
        return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.CREATED, 'Images uploaded successfully', uploaded);
    };
}
exports.UploadController = UploadController;
