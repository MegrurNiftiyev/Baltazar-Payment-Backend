const crypto = require('crypto');

/**
 * Generates a unique, opaque transaction ID for every payment attempt.
 * Format: "txn_" + 10 hex characters (5 random bytes).
 */
const generateTransactionId = () => {
  return 'txn_' + crypto.randomBytes(5).toString('hex');
};

module.exports = generateTransactionId;
