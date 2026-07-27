/**
 * Masks 16-digit card number according to PCI-DSS display guidelines.
 * "4539974024498311" → "•••• •••• •••• 8311"
 */
const maskCardNumber = (cardNumber) => {
  if (!cardNumber || cardNumber.length < 4) {
    return '••••';
  }

  const last4 = cardNumber.slice(-4);
  return `•••• •••• •••• ${last4}`;
};

module.exports = maskCardNumber;
