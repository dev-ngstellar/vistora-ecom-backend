import { Router } from 'express';
import { asyncHandler } from '../../utils/async-handler.util';
import { UploadController, uploadMiddleware } from './upload.controller';

const uploadRouter = Router();
const uploadController = new UploadController();

uploadRouter.post('/upload', uploadMiddleware.single('file'), asyncHandler(uploadController.uploadSingle));
uploadRouter.post('/upload/multiple', uploadMiddleware.array('files', 10), asyncHandler(uploadController.uploadMultiple));

export { uploadRouter };
