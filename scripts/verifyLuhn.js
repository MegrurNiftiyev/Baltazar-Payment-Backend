const fs = require('fs');
const path = require('path');

const seedPath = path.join(__dirname, '..', 'src', 'data', 'cards.seed.json');

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

const cards = JSON.parse(fs.readFileSync(seedPath, 'utf-8'));

let failingCount = 0;
const numbers = new Set();
const pmIds = new Set();

cards.forEach((card, index) => {
  const isLuhn = validateLuhn(card.cardNumber);
  if (!isLuhn) {
    failingCount++;
    console.error(`Card index ${index} (${card.cardNumber}) failed Luhn check.`);
  }

  // Check prefix matches brand
  if (card.brand === 'VISA' && !card.cardNumber.startsWith('4')) {
    console.error(`Card index ${index} brand VISA but number is ${card.cardNumber}`);
  }
  if (card.brand === 'MASTERCARD' && !/^(5[1-5]|2[2-7])/.test(card.cardNumber)) {
    console.error(`Card index ${index} brand MASTERCARD but number is ${card.cardNumber}`);
  }

  // Check last4
  if (card.last4 !== card.cardNumber.slice(-4)) {
    console.error(`Card index ${index} last4 mismatch: ${card.last4} vs ${card.cardNumber.slice(-4)}`);
  }

  numbers.add(card.cardNumber);
  pmIds.add(card.paymentMethodId);
});

console.log(`Total Cards Checked: ${cards.length}`);
console.log(`Failing Luhn: ${failingCount}`);
console.log(`Unique Card Numbers: ${numbers.size}`);
console.log(`Unique PaymentMethodIds: ${pmIds.size}`);
