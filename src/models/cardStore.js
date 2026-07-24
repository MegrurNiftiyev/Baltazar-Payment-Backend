const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');
const cardsPath = path.join(dataDir, 'cards.json');
const seedPath = path.join(dataDir, 'cards.seed.json');

let writeLock = false;

const ensureDataFile = () => {
  if (!fs.existsSync(cardsPath)) {
    if (fs.existsSync(seedPath)) {
      fs.copyFileSync(seedPath, cardsPath);
      console.log('[CARDSTORE] Initialized cards.json from seed file');
    } else {
      throw new Error('cards.seed.json missing — cannot initialize data layer');
    }
  }
};

const readCards = () => {
  ensureDataFile();
  const content = fs.readFileSync(cardsPath, 'utf-8');
  return JSON.parse(content);
};

const writeCards = (cards) => {
  while (writeLock) {
    // In-process lock wait
  }
  writeLock = true;
  try {
    fs.writeFileSync(cardsPath, JSON.stringify(cards, null, 2), 'utf-8');
  } finally {
    writeLock = false;
  }
};

const findByCardNumber = (cardNumber) => {
  const cards = readCards();
  return cards.find((c) => c.cardNumber === cardNumber) || null;
};

const findByPaymentMethodId = (paymentMethodId) => {
  const cards = readCards();
  return cards.find((c) => c.paymentMethodId === paymentMethodId) || null;
};

const updateBalance = (paymentMethodId, newBalance) => {
  const cards = readCards();
  const card = cards.find((c) => c.paymentMethodId === paymentMethodId);
  if (card) {
    card.balance = Math.round(newBalance * 100) / 100;
    writeCards(cards);
  }
  return card;
};

const getOriginalSeedCard = (paymentMethodId) => {
  if (!fs.existsSync(seedPath)) return null;
  const seed = JSON.parse(fs.readFileSync(seedPath, 'utf-8'));
  return seed.find((c) => c.paymentMethodId === paymentMethodId) || null;
};

const resetBalance = (paymentMethodId) => {
  const seedCard = getOriginalSeedCard(paymentMethodId);
  if (!seedCard) return null;
  return updateBalance(paymentMethodId, seedCard.balance);
};

const listAll = () => {
  const cards = readCards();
  return cards.map(({ cvv, ...rest }) => rest);
};

module.exports = {
  ensureDataFile,
  findByCardNumber,
  findByPaymentMethodId,
  updateBalance,
  resetBalance,
  listAll,
};
