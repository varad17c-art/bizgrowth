import { Request, Response, NextFunction } from 'express';

/**
 * Validation Middleware Factory
 *
 * Creates middleware that validates request body fields
 * against a set of required field names.
 *
 * Usage:
 *   router.post('/register', validate('name', 'email', 'password'), handler);
 */
export const validate = (...requiredFields: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const missingFields: string[] = [];

    for (const field of requiredFields) {
      const value = req.body[field];
      if (value === undefined || value === null || value === '') {
        missingFields.push(field);
      }
    }

    if (missingFields.length > 0) {
      res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`,
        errors: missingFields.map((field) => ({
          [field]: `${field} is required`,
        })),
      });
      return;
    }

    next();
  };
};
