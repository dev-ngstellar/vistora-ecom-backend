import { NextFunction, Request, RequestHandler, Response } from 'express';
import { AnyZodObject } from 'zod';
import { asyncHandler } from '../utils/async-handler.util';

export const validateRequest = (schema: AnyZodObject): RequestHandler => {
  return asyncHandler(async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    await schema.parseAsync({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  });
};
