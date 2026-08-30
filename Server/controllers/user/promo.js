const createError = require("http-errors");
const db = require("../../config/db");

exports.use_promo_code = (req, res, next) => {
  try {
    const { promo_id, order_amount } = req.params;

    if (!promo_id || isNaN(promo_id)) {
      return next(createError.BadRequest('Invalid promo_id'));
    }
    if (!order_amount || isNaN(order_amount)) {
      return next(createError.BadRequest('Invalid order amount!'));
    }

    let fetchDetails = "SELECT * FROM promo_codes WHERE id = ? AND is_active = 1";
    db.query(fetchDetails, [promo_id], (error, result) => {
      if (error || result.length == 0) {
        return next(error || createError.NotFound('Requested promo_code does not exist!'));
      }

      let today = new Date().toISOString().split('T')[0];  // Current date in "YYYY-MM-DD" format

      if (result[0].start_date <= today && today <= result[0].end_date) {
        let min_order_amount = Number(result[0].min_order_amount);
        
        if (order_amount < min_order_amount) {
          return next(createError.BadRequest('Order amount is lesser than required criteria!'));
        }

        let discount_amount;
        if (result[0].discount_type === 'percentage') {
          discount_amount = (result[0].discount_value / 100) * order_amount;
        } else {
          discount_amount = order_amount - result[0].discount_value;
        }

        let max_discount = result[0].max_discount;
 
        if (max_discount !== null && discount_amount > max_discount) {
          return next(createError.BadRequest('Discount limit exceeded!'));
        }

        let updateCount = "UPDATE promo_codes SET used_count = used_count + 1 WHERE id = ?";
        db.query(updateCount, [promo_id], (updateError, updateResult) => {
          if (updateError || updateResult.affectedRows === 0) {
            return next(updateError || createError.InternalServerError('Failed to update used count.'));
          }

          res.send(`Promo code applied successfully! Discount: ${discount_amount.toFixed(2)}`);
        });

      } else {
        return next(createError.BadRequest('Promo code expired!'));
      }
    });
  } catch (error) {
    next(error);
  }
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
    const cleanCode = code.trim().toUpperCase();
    const amount = Number(order_amount) || 0;

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