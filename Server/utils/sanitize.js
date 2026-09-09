/**
 * Input sanitization utility to prevent Stored & Reflected XSS attacks
 */

/**
 * Strips HTML tags and dangerous characters from a string
 * @param {string} input 
 * @param {number} [maxLength=1000]
 * @returns {string}
 */
function sanitizeText(input, maxLength = 1000) {
  if (input === null || input === undefined) return '';
  if (typeof input !== 'string') input = String(input);
  
  // Remove HTML tags
  let cleaned = input.replace(/<[^>]*>?/gm, '');
  
  // Strip control characters except newline and tab
  cleaned = cleaned.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  
  // Truncate to maximum allowed length
  if (maxLength && cleaned.length > maxLength) {
    cleaned = cleaned.substring(0, maxLength);
  }
  
  return cleaned.trim();
}

/**
 * Validates and normalizes an email address
 * @param {string} email 
 * @returns {string|null} Normalized lowercase email or null if invalid
 */
function validateEmail(email) {
  if (!email || typeof email !== 'string') return null;
  const trimmed = email.trim().toLowerCase();
  // Standard RFC 5322 compatible regex
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  if (!emailRegex.test(trimmed) || trimmed.length > 120) {
    return null;
  }
  return trimmed;
}

/**
 * Validates phone numbers (numeric with optional +, 7 to 15 digits)
 * @param {string} phone 
 * @returns {string|null} Clean phone or null if invalid
 */
function validatePhone(phone) {
  if (!phone || typeof phone !== 'string') return null;
  const trimmed = phone.trim();
  const phoneRegex = /^[+]?[\d\s-]{7,16}$/;
  if (!phoneRegex.test(trimmed)) {
    return null;
  }
  return trimmed.replace(/[\s-]/g, '');
}

/**
 * Sanitizes alphanumeric identifiers (order numbers, promo codes, IDs)
 * @param {string} val 
 * @param {number} [maxLength=50]
 * @returns {string}
 */
function sanitizeIdentifier(val, maxLength = 50) {
  if (!val || typeof val !== 'string') return '';
  return val.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, maxLength);
}

module.exports = {
  sanitizeText,
  validateEmail,
  validatePhone,
  sanitizeIdentifier
};
