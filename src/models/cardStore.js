const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');
const cardsPath = path.join(dataDir, 'cards.json');
const seedPath = path.join(dataDir, 'cards.seed.json');

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
  fs.writeFileSync(cardsPath, JSON.stringify(cards, null, 2), 'utf-8');
};

const findByCardNumber = (cardNumber) => {
  const cards = readCards();
  return cards.find((c) => c.cardNumber === cardNumber) || null;
};

const findByPaymentMethodId = (paymentMethodId) => {
  const cards = readCards();
  return cards.find((c) => c.paymentMethodId === paymentMethodId) || null;
};

const { toMajorUnits } = require('../utils/money');

const updateBalance = (paymentMethodId, newBalance) => {
  const cards = readCards();
  const card = cards.find((c) => c.paymentMethodId === paymentMethodId);
  if (card) {
    card.balance = Math.round(newBalance);
    writeCards(cards);
  }
  return card;
};

const resetAllBalances = () => {
  if (!fs.existsSync(seedPath)) {
    throw new Error('cards.seed.json missing — cannot reset data layer');
  }
  const seedContent = fs.readFileSync(seedPath, 'utf-8');
  fs.writeFileSync(cardsPath, seedContent, 'utf-8');
  const cards = JSON.parse(seedContent);
  return cards.map(({ cvv, ...rest }) => ({
    ...rest,
    balance: typeof rest.balance === 'number' ? toMajorUnits(rest.balance) : rest.balance
  }));
};

const listAll = () => {
  const cards = readCards();
  return cards.map(({ cvv, ...rest }) => ({
    ...rest,
    balance: typeof rest.balance === 'number' ? toMajorUnits(rest.balance) : rest.balance
  }));
};

module.exports = {
  ensureDataFile,
  findByCardNumber,
  findByPaymentMethodId,
  updateBalance,
  resetAllBalances,
  listAll,
};

