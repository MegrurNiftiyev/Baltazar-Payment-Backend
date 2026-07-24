const rateLimit = require('express-rate-limit');
const { RateLimitedError } = require('../errors/customErrors');

const rateLimitMiddleware = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
  limit: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    next(new RateLimitedError());
  }
});

module.exports = rateLimitMiddleware;
