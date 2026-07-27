/**
 * Utility functions for currency precision handling.
 * Internal calculations and storage are kept in integer minor units (qəpik / cents).
 * External API inputs/outputs expose major units (floats formatted to 2 decimal places).
 */

/**
 * Converts a major unit amount (e.g. 45.50 AZN) to integer minor units (e.g. 4550 qəpik).
 * Safe against JavaScript floating-point representation bugs.
 * @param {number} amountMajor
 * @returns {number} Integer minor units
 */
const toMinorUnits = (amountMajor) => {
  if (typeof amountMajor !== 'number' || Number.isNaN(amountMajor)) {
    return 0;
  }
  return Math.round(Number((amountMajor * 100).toFixed(6)));
};

/**
 * Converts integer minor units (e.g. 4550 qəpik) to major unit amount (e.g. 45.50 AZN).
 * @param {number} amountMinor
 * @returns {number} Major unit float with 2 decimal precision
 */
const toMajorUnits = (amountMinor) => {
  if (typeof amountMinor !== 'number' || Number.isNaN(amountMinor)) {
    return 0;
  }
  return Number((Math.round(amountMinor) / 100).toFixed(2));
};

module.exports = {
  toMinorUnits,
  toMajorUnits,
};
