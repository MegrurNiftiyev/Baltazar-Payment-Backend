const { AppError } = require('../errors/customErrors');
const generateTransactionId = require('../utils/generateTransactionId');

/**
 * Centralized error handling middleware.
 * Catches all thrown errors and returns consistent { success: false, errorCode, message } shape.
 * Translates message using req.t(errorCode) based on Accept-Language.
 */
const errorMiddleware = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  const lang = req.lang || 'en';
  const t = req.t || ((code) => code);

  if (err instanceof AppError || err.isOperational) {
    const response = {
      success: false,
      errorCode: err.errorCode || 'INTERNAL_ERROR',
      message: t(err.errorCode) || err.message
    };

    // For charge endpoint errors, attach transaction tracking metadata
    if (req.originalUrl && req.originalUrl.includes('/charges')) {
      response.transactionId = generateTransactionId();
      response.status = 'FAILED';
      response.processedAt = new Date().toISOString();
    }

    return res.status(err.statusCode).json(response);
  }

  // Handle JSON syntax / parsing errors
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      errorCode: 'VALIDATION_ERROR',
      message: t('VALIDATION_ERROR')
    });
  }

  // Log unhandled non-operational server errors
  console.error('[UNHANDLED ERROR]', err);

  return res.status(500).json({
    success: false,
    errorCode: 'INTERNAL_ERROR',
    message: 'Internal server error'
  });
};

module.exports = errorMiddleware;
