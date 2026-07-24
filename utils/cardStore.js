const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');
const cardsPath = path.join(dataDir, 'cards.json');
const seedPath = path.join(dataDir, 'cards.seed.json');

/**
 * On first load, copy seed to cards.json if it doesn't exist.
 */
function ensureCardsFile() {
  if (!fs.existsSync(cardsPath)) {
    if (fs.existsSync(seedPath)) {
      fs.copyFileSync(seedPath, cardsPath);
      console.log('[INIT] cards.json created from cards.seed.json');
    } else {
      throw new Error('cards.seed.json not found — cannot initialize card data.');
    }
  }
}

/**
 * Read all cards from cards.json (synchronous).
 */
function readCards() {
  ensureCardsFile();
  const raw = fs.readFileSync(cardsPath, 'utf-8');
  return JSON.parse(raw);
}

/**
 * Write the full cards array back to cards.json.
 */
function writeCards(cards) {
  fs.writeFileSync(cardsPath, JSON.stringify(cards, null, 2), 'utf-8');
}

/**
 * Find a card by its 16-digit card number.
 */
function findByCardNumber(cardNumber) {
  const cards = readCards();
  return cards.find(c => c.cardNumber === cardNumber) || null;
}

/**
 * Find a card by its paymentMethodId token.
 */
function findByPaymentMethodId(paymentMethodId) {
  const cards = readCards();
  return cards.find(c => c.paymentMethodId === paymentMethodId) || null;
}

/**
 * Update a card's balance and persist to file.
 * Rounds to 2 decimal places to avoid float precision issues.
 */
function updateBalance(paymentMethodId, newBalance) {
  const cards = readCards();
  const card = cards.find(c => c.paymentMethodId === paymentMethodId);
  if (card) {
    card.balance = Math.round(newBalance * 100) / 100;
    writeCards(cards);
  }
  return card;
}

/**
 * Get original balance from seed file.
 */
function getOriginalBalance(paymentMethodId) {
  if (!fs.existsSync(seedPath)) return null;
  const seed = JSON.parse(fs.readFileSync(seedPath, 'utf-8'));
  const card = seed.find(c => c.paymentMethodId === paymentMethodId);
  return card ? card.balance : null;
}

/**
 * Reset a card's balance to its original seed value.
 */
function resetBalance(paymentMethodId) {
  const originalBalance = getOriginalBalance(paymentMethodId);
  if (originalBalance === null) return null;
  return updateBalance(paymentMethodId, originalBalance);
}

/**
 * Return all cards (for debug listing).
 */
function getAllCards() {
  return readCards();
}

module.exports = {
  ensureCardsFile,
  readCards,
  writeCards,
  findByCardNumber,
  findByPaymentMethodId,
  updateBalance,
  resetBalance,
  getAllCards
};
