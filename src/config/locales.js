const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, '..', 'locales');

const locales = {
  en: JSON.parse(fs.readFileSync(path.join(localesDir, 'en.json'), 'utf-8')),
  az: JSON.parse(fs.readFileSync(path.join(localesDir, 'az.json'), 'utf-8')),
  ru: JSON.parse(fs.readFileSync(path.join(localesDir, 'ru.json'), 'utf-8'))
};

const getLocales = () => locales;

module.exports = { getLocales };
