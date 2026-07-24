const { NetworkTimeoutError } = require('../errors/customErrors');

/**
 * Simulates random network failures (~5% probability).
 * Throws NetworkTimeoutError to mimic real gateway transient failures.
 * Can be disabled via DISABLE_RANDOM_FAILURES=true env var.
 */
const maybeFailRandomly = () => {
  if (process.env.DISABLE_RANDOM_FAILURES === 'true') {
    return;
  }

  if (Math.random() < 0.05) {
    throw new NetworkTimeoutError();
  }
};

module.exports = maybeFailRandomly;
