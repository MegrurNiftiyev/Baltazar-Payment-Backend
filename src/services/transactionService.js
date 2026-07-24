const generateTransactionId = require('../utils/generateTransactionId');

/**
 * Creates transaction records/identifiers for payment attempts.
 * Ensures every transaction attempt (success or failure) receives a traceable ID.
 */
class TransactionService {
  createTransaction() {
    return {
      transactionId: generateTransactionId(),
      processedAt: new Date().toISOString()
    };
  }
}

module.exports = new TransactionService();
