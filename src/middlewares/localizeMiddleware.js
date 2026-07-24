const { getLocales } = require('../config/locales');

/**
 * Middleware that inspects Accept-Language header, resolves to supported language (en, az, ru),
 * and attaches helper functions req.lang and req.t(errorCode) to the request.
 */
const localizeMiddleware = (req, res, next) => {
  const header = (req.headers['accept-language'] || '').toLowerCase();

  let lang = 'en';
  if (header.startsWith('az') || header.includes(',az') || header.includes(' az')) {
    lang = 'az';
  } else if (header.startsWith('ru') || header.includes(',ru') || header.includes(' ru')) {
    lang = 'ru';
  }

  const locales = getLocales();

  req.lang = lang;
  req.t = (errorCode) => {
    const dict = locales[lang] || locales['en'];
    return dict[errorCode] || errorCode;
  };

  next();
};

module.exports = localizeMiddleware;
