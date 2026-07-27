const rateLimit = require('express-rate-limit');
const { getEnv } = require('../config/env');
const { RateLimitedError } = require('../errors/customErrors');

const env = getEnv();

const rateLimitMiddleware = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  limit: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    next(new RateLimitedError());
  }
});

module.exports = rateLimitMiddleware;
