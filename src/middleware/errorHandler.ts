import type { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  status?: number; // capture status of error
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err);
  // return response when error through next() in controller
  res.status(err.status || 500).json({ // default to status 500
    message: err.message || 'Internal Server Error', // default to internal server error
  });
};