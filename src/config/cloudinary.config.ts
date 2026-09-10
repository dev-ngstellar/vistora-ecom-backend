import { v2 as cloudinary } from 'cloudinary';
import { env } from './env.config';
import { logger } from './logger.config';

if (env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  logger.info('Cloudinary SDK configured successfully');
} else {
  logger.warn('Cloudinary credentials missing, upload service may use local fallback');
}

export { cloudinary };
