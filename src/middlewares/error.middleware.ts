import { Request, Response, NextFunction } from 'express';
import logger from '../logging/logger';

const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.status || 500;
  const message = err.message || 'Something went wrong';

  logger.error(err); // Log the error for debugging

  res.status(statusCode).json({
    status: 'error',
    message: message,
  });
};

export default errorHandler;
