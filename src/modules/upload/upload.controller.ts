import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { ApiError } from '../../utils/api-error.util';
import { ApiResponseHandler } from '../../utils/api-response.util';
import { HTTP_STATUS } from '../../constants/http-status.constant';

const uploadDir = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

const fileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp|svg|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  }
  cb(new ApiError(HTTP_STATUS.BAD_REQUEST, 'Only image files (jpg, jpeg, png, webp, svg, gif) are allowed'));
};

export const uploadMiddleware = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

export class UploadController {
  public uploadSingle = async (req: Request, res: Response): Promise<Response> => {
    if (!req.file) {
      throw ApiError.badRequest('No image file provided');
    }

    const host = req.get('host') || 'localhost:4000';
    const protocol = req.protocol || 'http';
    const fileUrl = `${protocol}://${host}/uploads/${req.file.filename}`;

    return ApiResponseHandler.success(res, HTTP_STATUS.CREATED, 'Image uploaded successfully', {
      url: fileUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimeType: req.file.mimetype,
    });
  };

  public uploadMultiple = async (req: Request, res: Response): Promise<Response> => {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      throw ApiError.badRequest('No image files provided');
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

    return ApiResponseHandler.success(res, HTTP_STATUS.CREATED, 'Images uploaded successfully', uploaded);
  };
}
