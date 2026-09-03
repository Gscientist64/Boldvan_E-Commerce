// backend/src/utils/validate.ts
// Thin wrapper around express-validator that returns the FIRST error as a clean
// { message } so route handlers don't each need to call validationResult().

import { Request, Response, NextFunction } from 'express';
import { ValidationChain, validationResult } from 'express-validator';

export const validate = (rules: ValidationChain[]) => [
  ...rules,
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: errors.array()[0]?.msg || 'Validation failed',
        errors: errors.array()
      });
    }
    next();
  }
];
