const createError = require("http-errors");
const db = require("../../config/db");
const { sanitizeIdentifier } = require("../../utils/sanitize");

exports.use_promo_code = (req, res, next) => {
  return res.status(403).json({
    success: false,
    message: "Direct promo code redemption endpoint is disabled for security. Promo codes are verified and applied atomically during checkout."
  });
};

/**
 * Validate promo code against database in real-time
 */
exports.validate_promo = (req, res, next) => {
  try {
    const { code, order_amount } = req.body;
    if (!code || typeof code !== 'string') {
      return res.status(400).json({ success: false, message: 'Please enter a promo code.' });
    }
    const cleanCode = sanitizeIdentifier(code, 30).toUpperCase();
    if (!cleanCode) {
      return res.status(400).json({ success: false, message: 'Invalid promo code format.' });
    }
    const amount = Math.max(0, Number(order_amount) || 0);

    const sql = "SELECT * FROM promo_codes WHERE UPPER(code) = ? AND is_active = 1 LIMIT 1";
    db.query(sql, [cleanCode], (err, rows) => {
      if (err) return next(err);
      if (!rows || rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Invalid or expired promo code.' });
      }

      const promo = rows[0];
      const today = new Date().toISOString().split('T')[0];

      if (promo.start_date && promo.start_date > today) {
        return res.status(400).json({ success: false, message: 'This promo code is not active yet.' });
      }
      if (promo.end_date && promo.end_date < today) {
        return res.status(400).json({ success: false, message: 'This promo code has expired.' });
      }
      if (promo.usage_limit != null && promo.used_count >= promo.usage_limit) {
        return res.status(400).json({ success: false, message: 'This promo code has reached its usage limit.' });
      }

      const minOrder = Number(promo.min_order_amount) || 0;
      if (amount < minOrder) {
        return res.status(400).json({
          success: false,
          message: `Minimum order amount of ₹${minOrder.toLocaleString('en-IN')} required for this code.`,
        });
      }

      let discountAmount = 0;
      if (promo.discount_type === 'percentage') {
        discountAmount = (Number(promo.discount_value) / 100) * amount;
        if (promo.max_discount != null && discountAmount > Number(promo.max_discount)) {
          discountAmount = Number(promo.max_discount);
        }
      } else {
        discountAmount = Number(promo.discount_value);
      }

      discountAmount = Math.min(discountAmount, amount);

      return res.json({
        success: true,
        message: `Promo code ${promo.code} applied successfully!`,
        promo: {
          id: promo.id,
          code: promo.code,
          discount_type: promo.discount_type,
          discount_value: Number(promo.discount_value),
          discount_amount: Math.round(discountAmount),
          min_order_amount: minOrder,
          max_discount: promo.max_discount ? Number(promo.max_discount) : null,
        },
      });
    });
  } catch (e) {
    next(e);
  }
};