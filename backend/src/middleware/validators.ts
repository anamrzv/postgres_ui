import { body, param, validationResult } from 'express-validator';

export const validateTableName = [
  param('tableName')
    .isString()
    .trim()
    .notEmpty()
    .matches(/^[a-zA-Z_][a-zA-Z0-9_]*$/)
    .withMessage('Invalid table name'),
  (req: any, res: any, next: any) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    next();
  }
];

export const validateRowData = [
  body().isObject().withMessage('Request body must be an object'),
  (req: any, res: any, next: any) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    next();
  }
];
