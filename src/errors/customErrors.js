class AppError extends Error {
  constructor(message, statusCode, errorCode) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

class InvalidCardNumberError extends AppError {
  constructor(message = 'Invalid card number format') {
    super(message, 400, 'INVALID_CARD_NUMBER');
  }
}

class CardNotFoundError extends AppError {
  constructor(message = 'Card not found') {
    super(message, 404, 'CARD_NOT_FOUND');
  }
}

class InvalidCvvError extends AppError {
  constructor(message = 'Invalid CVV code') {
    super(message, 400, 'INVALID_CVV');
  }
}

class CardExpiredError extends AppError {
  constructor(message = 'This card has expired') {
    super(message, 400, 'CARD_EXPIRED');
  }
}

class CardBlockedError extends AppError {
  constructor(message = 'This card is blocked') {
    super(message, 403, 'CARD_BLOCKED');
  }
}

class CardDeclinedError extends AppError {
  constructor(message = 'Transaction declined by the bank') {
    super(message, 403, 'CARD_DECLINED');
  }
}

class PaymentMethodNotFoundError extends AppError {
  constructor(message = 'Payment method not found') {
    super(message, 404, 'PAYMENT_METHOD_NOT_FOUND');
  }
}

class InsufficientFundsError extends AppError {
  constructor(message = 'Insufficient funds on the card') {
    super(message, 402, 'INSUFFICIENT_FUNDS');
  }
}

class AmountInvalidError extends AppError {
  constructor(message = 'Invalid transaction amount') {
    super(message, 400, 'AMOUNT_INVALID');
  }
}

class NetworkTimeoutError extends AppError {
  constructor(message = 'Network timeout — please try again') {
    super(message, 504, 'NETWORK_TIMEOUT');
  }
}

class ValidationError extends AppError {
  constructor(message = 'Validation failed') {
    super(message, 400, 'VALIDATION_ERROR');
  }
}

class RateLimitedError extends AppError {
  constructor(message = 'Too many requests, please try again later') {
    super(message, 429, 'RATE_LIMITED');
  }
}

module.exports = {
  AppError,
  InvalidCardNumberError,
  CardNotFoundError,
  InvalidCvvError,
  CardExpiredError,
  CardBlockedError,
  CardDeclinedError,
  PaymentMethodNotFoundError,
  InsufficientFundsError,
  AmountInvalidError,
  NetworkTimeoutError,
  ValidationError,
  RateLimitedError,
};
