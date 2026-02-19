export const errorHandler = (err: any, req: any, res: any, next: any) => {
  console.error('Error:', err);

  // PostgreSQL errors
  if (err.code) {
    switch (err.code) {
      case '23505': // Unique violation
        return res.status(409).json({
          success: false,
          message: 'Duplicate entry',
          error: err.detail
        });
      case '23503': // Foreign key violation
        return res.status(400).json({
          success: false,
          message: 'Foreign key constraint violation',
          error: err.detail
        });
      case '42P01': // Undefined table
        return res.status(404).json({
          success: false,
          message: 'Table not found',
          error: err.message
        });
      case '42703': // Undefined column
        return res.status(400).json({
          success: false,
          message: 'Column not found',
          error: err.message
        });
    }
  }

  // Default error
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};
