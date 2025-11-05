import type { Request, Response, NextFunction } from 'express';
import RequestHandler from '../utils/RequestHandler.js';
import logger from '../utils/logger.js';

export interface AppError extends Error {
  status?: number; // capture status of error
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // return response when error through next() in controller
  // default to status 500 and internal server error message
  logger.error(err.message, { stack: err.stack });
  return RequestHandler.sendError(res, err.message || 'Internal Server Error', err.status || 500);
};