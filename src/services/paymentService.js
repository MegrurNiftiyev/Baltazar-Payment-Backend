const cardStore = require('../models/cardStore');
const transactionService = require('./transactionService');
const maybeFailRandomly = require('../utils/randomFailure');
const {
  InvalidCardNumberError,
  CardNotFoundError,
  InvalidCvvError,
  CardExpiredError,
  CardBlockedError,
  CardDeclinedError,
  PaymentMethodNotFoundError,
  InsufficientFundsError,
  AmountInvalidError
} = require('../errors/customErrors');

const validateLuhn = (cardNumber) => {
  if (!/^\d{16}$/.test(cardNumber)) return false;
  let sum = 0;
  let shouldDouble = false;
  for (let i = cardNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cardNumber.charAt(i), 10);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
};

class PaymentService {
  tokenize(data) {
    const { cardNumber, cvv } = data;

    // 1. Luhn validation
    if (!validateLuhn(cardNumber)) {
      throw new InvalidCardNumberError();
    }

    // 2. Card lookup
    const card = cardStore.findByCardNumber(cardNumber);
    if (!card) {
      throw new CardNotFoundError();
    }

    // 3. CVV match
    if (card.cvv !== cvv) {
      throw new InvalidCvvError();
    }

    // 4. Status checks
    if (card.status === 'EXPIRED') {
      throw new CardExpiredError();
    }
    if (card.status === 'BLOCKED') {
      throw new CardBlockedError();
    }
    if (card.status === 'STOLEN') {
      throw new CardDeclinedError();
    }

    return {
      success: true,
      paymentMethodId: card.paymentMethodId,
      brand: card.brand,
      last4: card.last4,
      expiryMonth: card.expiryMonth,
      expiryYear: card.expiryYear
    };
  }

  charge(data) {
    const { paymentMethodId, amount, currency } = data;
    const txn = transactionService.createTransaction();

    // 1. Amount check
    if (amount <= 0) {
      throw new AmountInvalidError();
    }

    // 2. Payment method lookup
    const card = cardStore.findByPaymentMethodId(paymentMethodId);
    if (!card) {
      throw new PaymentMethodNotFoundError();
    }

    // 3. Forced result short-circuit
    if (card.forcedResult) {
      if (card.forcedResult === 'SUCCESS') {
        const newBalance = Math.round((card.balance - amount) * 100) / 100;
        cardStore.updateBalance(paymentMethodId, newBalance);

        return {
          success: true,
          transactionId: txn.transactionId,
          status: 'SUCCESS',
          amount,
          currency: currency || card.currency,
          remainingBalance: newBalance,
          processedAt: txn.processedAt
        };
      }

      if (card.forcedResult === 'INSUFFICIENT_FUNDS') {
        throw new InsufficientFundsError();
      }
      if (card.forcedResult === 'CARD_BLOCKED') {
        throw new CardBlockedError();
      }
      if (card.forcedResult === 'CARD_DECLINED') {
        throw new CardDeclinedError();
      }
    }

    // 4. Card status checks
    if (card.status === 'EXPIRED') {
      throw new CardExpiredError();
    }
    if (card.status === 'BLOCKED') {
      throw new CardBlockedError();
    }
    if (card.status === 'STOLEN') {
      throw new CardDeclinedError();
    }

    // 5. Random network failure injection
    maybeFailRandomly();

    // 6. Balance check
    if (card.balance < amount) {
      throw new InsufficientFundsError();
    }

    // 7. Deduct and persist
    const newBalance = Math.round((card.balance - amount) * 100) / 100;
    cardStore.updateBalance(paymentMethodId, newBalance);

    return {
      success: true,
      transactionId: txn.transactionId,
      status: 'SUCCESS',
      amount,
      currency: currency || card.currency,
      remainingBalance: newBalance,
      processedAt: txn.processedAt
    };
  }

  listMethods() {
    return {
      cards: cardStore.listAll()
    };
  }

  resetMethod(paymentMethodId) {
    const card = cardStore.resetBalance(paymentMethodId);
    if (!card) {
      throw new PaymentMethodNotFoundError();
    }
    return {
      success: true,
      paymentMethodId: card.paymentMethodId,
      balance: card.balance,
      message: 'Balance reset to original seed value'
    };
  }
}

module.exports = new PaymentService();
