/**
 * Masks a card number for safe logging.
 * "4539148803436467" → "•••• •••• •••• 6467"
 */
const maskCardNumber = (cardNumber) => {
  if (!cardNumber || cardNumber.length < 4) {
    return '••••';
  }

  const last4 = cardNumber.slice(-4);
  return `•••• •••• •••• ${last4}`;
};

module.exports = maskCardNumber;
