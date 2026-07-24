const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, '..', 'locales');

// Load all locale files at startup
const locales = {
  en: JSON.parse(fs.readFileSync(path.join(localesDir, 'en.json'), 'utf-8')),
  az: JSON.parse(fs.readFileSync(path.join(localesDir, 'az.json'), 'utf-8')),
  ru: JSON.parse(fs.readFileSync(path.join(localesDir, 'ru.json'), 'utf-8'))
};

/**
 * Parse the Accept-Language header and return the best matching language code.
 * Supports: az, en, ru. Defaults to 'en'.
 */
function getLanguage(req) {
  const header = (req.headers['accept-language'] || '').toLowerCase();

  // Check for explicit language tags (handles "az", "az-AZ", "az,en;q=0.9" etc.)
  if (header.startsWith('az') || header.includes(',az') || header.includes(' az')) return 'az';
  if (header.startsWith('ru') || header.includes(',ru') || header.includes(' ru')) return 'ru';

  return 'en';
}

/**
 * Get a localized message for a given errorCode and language.
 */
function getMessage(errorCode, lang) {
  const messages = locales[lang] || locales['en'];
  return messages[errorCode] || errorCode;
}

module.exports = { getLanguage, getMessage };
