import { Request, Response, NextFunction } from 'express';
import { AppError } from '../modules/auth/auth.service';

/**
 * Global Error Handler Middleware
 *
 * Catches all errors forwarded via next(error) and returns
 * a consistent JSON error response.
 */
const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Default values
  let statusCode = 500;
  let message = 'Internal Server Error';

  // Handle operational errors (AppError)
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  }

  // Handle errors with a statusCode property (e.g. from model layer)
  if ('statusCode' in err && typeof (err as any).statusCode === 'number') {
    statusCode = (err as any).statusCode;
    message = err.message;
  }

  // Handle Supabase / PostgreSQL unique constraint violation
  if (err.message?.includes('duplicate key') || err.message?.includes('unique')) {
    statusCode = 409;
    message = 'A record with this value already exists.';
  }

  // Log error in development
  if (process.env.NODE_ENV === 'development') {
    console.error('❌ Error:', {
      name: err.name,
      message: err.message,
      stack: err.stack,
    });
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export default errorHandler;
