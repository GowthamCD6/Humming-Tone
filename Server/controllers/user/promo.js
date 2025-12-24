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


// CREATE TABLE promo_codes (
//   id INT AUTO_INCREMENT PRIMARY KEY,
//   code VARCHAR(50) NOT NULL UNIQUE,
//   discount_type ENUM('percentage','fixed') DEFAULT 'percentage',
//   discount_value DECIMAL(10,2) NOT NULL,
//   min_order_amount DECIMAL(10,2) DEFAULT 0.00,
//   max_discount DECIMAL(10,2),
//   usage_limit INT,
//   used_count INT DEFAULT 0,
//   start_date DATETIME,
//   end_date DATETIME,
//   is_active TINYINT(1) DEFAULT 1,
//   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
// );