const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const {
  findByCardNumber,
  findByPaymentMethodId,
  updateBalance,
  resetBalance,
  getAllCards
} = require('../utils/cardStore');
const { getLanguage, getMessage } = require('../utils/localize');

/**
 * Generate a unique transaction ID (returned even on failures, like real banks).
 */
function generateTransactionId() {
  return 'txn_' + crypto.randomBytes(4).toString('hex');
}

// ──────────────────────────────────────────────
// POST /api/mock-bank/tokenize
// ──────────────────────────────────────────────
router.post('/tokenize', (req, res) => {
  const lang = getLanguage(req);
  const { cardNumber, cardHolder, expiryMonth, expiryYear, cvv } = req.body;

  const masked = cardNumber
    ? cardNumber.slice(0, 4) + '****' + cardNumber.slice(-4)
    : 'N/A';

  console.log(`[TOKENIZE] card=${masked}`);

  // 1. Validate card number format (exactly 16 digits)
  if (!cardNumber || !/^\d{16}$/.test(cardNumber)) {
    console.log(`[TOKENIZE] card=${masked} → INVALID_CARD_NUMBER`);
    return res.status(400).json({
      success: false,
      errorCode: 'INVALID_CARD_NUMBER',
      message: getMessage('INVALID_CARD_NUMBER', lang)
    });
  }

  // 2. Look up card in data store
  const card = findByCardNumber(cardNumber);
  if (!card) {
    console.log(`[TOKENIZE] card=${masked} → CARD_NOT_FOUND`);
    return res.status(404).json({
      success: false,
      errorCode: 'CARD_NOT_FOUND',
      message: getMessage('CARD_NOT_FOUND', lang)
    });
  }

  // 3. CVV verification
  if (cvv !== card.cvv) {
    console.log(`[TOKENIZE] card=${masked} → INVALID_CVV`);
    return res.status(400).json({
      success: false,
      errorCode: 'INVALID_CVV',
      message: getMessage('INVALID_CVV', lang)
    });
  }

  // 4. Card status checks
  if (card.status === 'EXPIRED') {
    console.log(`[TOKENIZE] card=${masked} → CARD_EXPIRED`);
    return res.status(400).json({
      success: false,
      errorCode: 'CARD_EXPIRED',
      message: getMessage('CARD_EXPIRED', lang)
    });
  }

  if (card.status === 'BLOCKED') {
    console.log(`[TOKENIZE] card=${masked} → CARD_BLOCKED`);
    return res.status(400).json({
      success: false,
      errorCode: 'CARD_BLOCKED',
      message: getMessage('CARD_BLOCKED', lang)
    });
  }

  if (card.status === 'STOLEN') {
    console.log(`[TOKENIZE] card=${masked} → CARD_DECLINED`);
    return res.status(400).json({
      success: false,
      errorCode: 'CARD_DECLINED',
      message: getMessage('CARD_DECLINED', lang)
    });
  }

  // 5. All checks passed — return token info
  console.log(`[TOKENIZE] card=${masked} → SUCCESS → ${card.paymentMethodId}`);
  return res.json({
    success: true,
    paymentMethodId: card.paymentMethodId,
    brand: card.brand,
    last4: card.last4,
    expiryMonth: card.expiryMonth,
    expiryYear: card.expiryYear
  });
});

// ──────────────────────────────────────────────
// POST /api/mock-bank/charge
// ──────────────────────────────────────────────
router.post('/charge', (req, res) => {
  const lang = getLanguage(req);
  const { paymentMethodId, amount, currency } = req.body;
  const transactionId = generateTransactionId();
  const processedAt = new Date().toISOString();

  console.log(`[CHARGE] token=${paymentMethodId} amount=${amount} currency=${currency}`);

  // 1. Amount validation
  if (amount === undefined || amount === null || amount <= 0) {
    console.log(`[CHARGE] ${transactionId} → AMOUNT_INVALID`);
    return res.status(400).json({
      success: false,
      errorCode: 'AMOUNT_INVALID',
      message: getMessage('AMOUNT_INVALID', lang),
      transactionId,
      status: 'FAILED',
      processedAt
    });
  }

  // 2. Find card by paymentMethodId
  const card = findByPaymentMethodId(paymentMethodId);
  if (!card) {
    console.log(`[CHARGE] ${transactionId} → PAYMENT_METHOD_NOT_FOUND`);
    return res.status(404).json({
      success: false,
      errorCode: 'PAYMENT_METHOD_NOT_FOUND',
      message: getMessage('PAYMENT_METHOD_NOT_FOUND', lang),
      transactionId,
      status: 'FAILED',
      processedAt
    });
  }

  // 3. Forced result — deterministic outcome regardless of balance
  if (card.forcedResult) {
    if (card.forcedResult === 'SUCCESS') {
      // Forced success: deduct balance (may go negative, that's fine for testing)
      const newBalance = Math.round((card.balance - amount) * 100) / 100;
      updateBalance(paymentMethodId, newBalance);
      console.log(`[CHARGE] ${transactionId} → FORCED SUCCESS (remaining=${newBalance})`);
      return res.json({
        success: true,
        transactionId,
        status: 'SUCCESS',
        amount,
        currency: currency || card.currency,
        remainingBalance: newBalance,
        processedAt
      });
    }
    // Forced failure
    console.log(`[CHARGE] ${transactionId} → FORCED ${card.forcedResult}`);
    return res.status(400).json({
      success: false,
      errorCode: card.forcedResult,
      message: getMessage(card.forcedResult, lang),
      transactionId,
      status: 'FAILED',
      processedAt
    });
  }

  // 4. Card status checks
  if (card.status === 'EXPIRED') {
    console.log(`[CHARGE] ${transactionId} → CARD_EXPIRED`);
    return res.status(400).json({
      success: false,
      errorCode: 'CARD_EXPIRED',
      message: getMessage('CARD_EXPIRED', lang),
      transactionId,
      status: 'FAILED',
      processedAt
    });
  }

  if (card.status === 'BLOCKED') {
    console.log(`[CHARGE] ${transactionId} → CARD_BLOCKED`);
    return res.status(400).json({
      success: false,
      errorCode: 'CARD_BLOCKED',
      message: getMessage('CARD_BLOCKED', lang),
      transactionId,
      status: 'FAILED',
      processedAt
    });
  }

  if (card.status === 'STOLEN') {
    console.log(`[CHARGE] ${transactionId} → CARD_DECLINED`);
    return res.status(400).json({
      success: false,
      errorCode: 'CARD_DECLINED',
      message: getMessage('CARD_DECLINED', lang),
      transactionId,
      status: 'FAILED',
      processedAt
    });
  }

  // 5. Random network timeout simulation (~5% chance)
  if (Math.random() < 0.05) {
    console.log(`[CHARGE] ${transactionId} → NETWORK_TIMEOUT (simulated)`);
    return res.status(504).json({
      success: false,
      errorCode: 'NETWORK_TIMEOUT',
      message: getMessage('NETWORK_TIMEOUT', lang),
      transactionId,
      status: 'FAILED',
      processedAt
    });
  }

  // 6. Balance check
  if (card.balance < amount) {
    console.log(`[CHARGE] ${transactionId} → INSUFFICIENT_FUNDS (balance=${card.balance}, requested=${amount})`);
    return res.status(400).json({
      success: false,
      errorCode: 'INSUFFICIENT_FUNDS',
      message: getMessage('INSUFFICIENT_FUNDS', lang),
      transactionId,
      status: 'FAILED',
      processedAt
    });
  }

  // 7. All checks passed — deduct balance and persist
  const newBalance = Math.round((card.balance - amount) * 100) / 100;
  updateBalance(paymentMethodId, newBalance);

  console.log(`[CHARGE] ${transactionId} → SUCCESS (remaining=${newBalance})`);
  return res.json({
    success: true,
    transactionId,
    status: 'SUCCESS',
    amount,
    currency: currency || card.currency,
    remainingBalance: newBalance,
    processedAt
  });
});

// ──────────────────────────────────────────────
// GET /api/mock-bank/cards  (debug/test only)
// ──────────────────────────────────────────────
router.get('/cards', (req, res) => {
  const cards = getAllCards();

  // Exclude CVV from the response for security
  const sanitized = cards.map(c => ({
    cardNumber: c.cardNumber,
    paymentMethodId: c.paymentMethodId,
    cardHolder: c.cardHolder,
    brand: c.brand,
    last4: c.last4,
    expiryMonth: c.expiryMonth,
    expiryYear: c.expiryYear,
    balance: c.balance,
    currency: c.currency,
    status: c.status,
    forcedResult: c.forcedResult
  }));

  console.log(`[CARDS] Listed ${sanitized.length} cards`);
  return res.json({ cards: sanitized });
});

// ──────────────────────────────────────────────
// POST /api/mock-bank/cards/:paymentMethodId/reset-balance
// ──────────────────────────────────────────────
router.post('/cards/:paymentMethodId/reset-balance', (req, res) => {
  const lang = getLanguage(req);
  const { paymentMethodId } = req.params;

  const card = resetBalance(paymentMethodId);
  if (!card) {
    console.log(`[RESET] ${paymentMethodId} → NOT FOUND`);
    return res.status(404).json({
      success: false,
      errorCode: 'PAYMENT_METHOD_NOT_FOUND',
      message: getMessage('PAYMENT_METHOD_NOT_FOUND', lang)
    });
  }

  console.log(`[RESET] ${paymentMethodId} → balance reset to ${card.balance}`);
  return res.json({
    success: true,
    paymentMethodId: card.paymentMethodId,
    balance: card.balance,
    message: 'Balance reset to original value'
  });
});

module.exports = router;
