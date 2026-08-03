import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/api-error.util';

export const notFoundHandler = (req: Request, _res: Response, next: NextFunction): void => {
  const error = ApiError.notFound(`Cannot ${req.method} ${req.originalUrl}`);
  next(error);
};
