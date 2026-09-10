import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { ApiError } from '../../utils/api-error.util';
import { ApiResponseHandler } from '../../utils/api-response.util';
import { HTTP_STATUS } from '../../constants/http-status.constant';
import { cloudinary } from '../../config/cloudinary.config';
import { env } from '../../config/env.config';
import { logger } from '../../config/logger.config';

// Memory storage for fast buffering & direct streaming to Cloudinary
const memoryStorage = multer.memoryStorage();

const fileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp|svg|gif|avif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname || mimetype) {
    return cb(null, true);
  }
  cb(new ApiError(HTTP_STATUS.BAD_REQUEST, 'Only image files (jpg, jpeg, png, webp, svg, gif, avif) are allowed'));
};

export const uploadMiddleware = multer({
  storage: memoryStorage,
  fileFilter,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB limit
});

const isCloudinaryReady = () => {
  return Boolean(env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET);
};

const uploadBufferToCloudinary = (
  fileBuffer: Buffer,
  folder = 'vistora_store'
): Promise<{ url: string; publicId: string; format?: string; bytes?: number }> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'auto',
      },
      (error, result) => {
        if (error || !result) {
          logger.error({ err: error }, 'Cloudinary upload error');
          return reject(error || new Error('Cloudinary upload failed'));
        }
        resolve({
          url: result.secure_url || result.url,
          publicId: result.public_id,
          format: result.format,
          bytes: result.bytes,
        });
      }
    );
    uploadStream.end(fileBuffer);
  });
};

export class UploadController {
  public uploadSingle = async (req: Request, res: Response): Promise<Response> => {
    if (!req.file) {
      throw ApiError.badRequest('No image file provided');
    }

    if (isCloudinaryReady()) {
      try {
        const result = await uploadBufferToCloudinary(req.file.buffer, 'vistora_products');
        return ApiResponseHandler.success(res, HTTP_STATUS.CREATED, 'Image uploaded to Cloudinary successfully', {
          url: result.url,
          filename: result.publicId,
          originalName: req.file.originalname,
          size: req.file.size,
          mimeType: req.file.mimetype,
          publicId: result.publicId,
        });
      } catch (err: any) {
        logger.error({ err }, 'Failed uploading single file to Cloudinary, fallback to local storage');
      }
    }

    // Fallback: Local Disk Storage if Cloudinary is offline/unconfigured
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    const ext = path.extname(req.file.originalname).toLowerCase();
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const filename = `${req.file.fieldname}-${uniqueSuffix}${ext}`;
    const filePath = path.join(uploadDir, filename);

    fs.writeFileSync(filePath, req.file.buffer);

    const host = req.get('host') || 'localhost:4000';
    const protocol = req.protocol || 'http';
    const fileUrl = `${protocol}://${host}/uploads/${filename}`;

    return ApiResponseHandler.success(res, HTTP_STATUS.CREATED, 'Image uploaded locally successfully', {
      url: fileUrl,
      filename,
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
        return ApiResponseHandler.success(res, HTTP_STATUS.CREATED, 'Images uploaded to Cloudinary successfully', uploaded);
      } catch (err: any) {
        logger.error({ err }, 'Failed uploading batch to Cloudinary, fallback to local storage');
      }
    }

    // Fallback: Local Disk Storage
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const host = req.get('host') || 'localhost:4000';
    const protocol = req.protocol || 'http';

    const uploaded = files.map((file) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const filename = `${file.fieldname}-${uniqueSuffix}${ext}`;
      const filePath = path.join(uploadDir, filename);

      fs.writeFileSync(filePath, file.buffer);

      return {
        url: `${protocol}://${host}/uploads/${filename}`,
        filename,
        originalName: file.originalname,
        size: file.size,
        mimeType: file.mimetype,
      };
    });

    return ApiResponseHandler.success(res, HTTP_STATUS.CREATED, 'Images uploaded locally successfully', uploaded);
  };
}
