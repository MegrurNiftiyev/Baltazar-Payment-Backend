const maskCardNumber = require('../utils/maskCardNumber');

/**
 * Request logging middleware.
 * Logs method, path, status, and duration.
 * Strictly masks sensitive values to avoid PCI-DSS leaks.
 */
const requestLogger = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const { method, originalUrl } = req;
    const { statusCode } = res;

    let targetInfo = '';
    if (req.body) {
      if (req.body.cardNumber) {
        targetInfo = ` card=${maskCardNumber(req.body.cardNumber)}`;
      } else if (req.body.paymentMethodId) {
        targetInfo = ` token=${req.body.paymentMethodId}`;
      }
    }

    console.log(`[HTTP] ${method} ${originalUrl}${targetInfo} → ${statusCode} (${duration}ms)`);
  });

  next();
};

module.exports = requestLogger;
