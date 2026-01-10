const db = require("../../config/db.js");
const createError = require("http-errors");

exports.checkoutOrders = async (req, res, next) => {
  try {
    const order_number = `ORD-${Date.now()}`;
    const {
      customer_name,
      customer_email,
      customer_phone,
      customer_address,
      city,
      state,
      pincode,
      order_instructions,
      promo_code,
      discount_amount,
      subtotal,
      shipping,
      total_amount,
      payment_id,
      razorpay_order_id,
      razorpay_signature,
      order_status,
      status,
    } = req.body;
    /* ================= REQUIRED STRING FIELDS ================= */
    const requiredStrings = {
      customer_name,
      customer_email,
      customer_phone,
      customer_address,
      city,
      state,
      pincode,
      payment_id,
      razorpay_order_id,
      razorpay_signature,
    };

    for (const [key, value] of Object.entries(requiredStrings)) {
      if (!value || typeof value !== "string" || value.trim() === "") {
        return next(createError.BadRequest(`${key} is required`));
      }
    }

    /* ================= EMAIL VALIDATION ================= */
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customer_email)) {
      return next(createError.BadRequest("Invalid customer_email format"));
    }

    /* ================= PHONE VALIDATION (India) ================= */
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(customer_phone)) {
      return next(createError.BadRequest("Invalid customer_phone number"));
    }

    /* ================= PINCODE VALIDATION (India) ================= */
    const pincodeRegex = /^\d{6}$/;
    if (!pincodeRegex.test(pincode)) {
      return next(createError.BadRequest("Invalid pincode"));
    }

    /* ================= NUMBER VALIDATIONS ================= */
    const numericFields = {
      subtotal,
      shipping,
      total_amount,
    };

    for (const [key, value] of Object.entries(numericFields)) {
      if (
        value === undefined ||
        value === null ||
        isNaN(value) ||
        Number(value) < 0
      ) {
        return next(createError.BadRequest(`${key} must be a valid number`));
      }
    }

    /* ================= OPTIONAL NUMBERS ================= */
    if (
      discount_amount !== undefined &&
      (isNaN(discount_amount) || discount_amount < 0)
    ) {
      return next(
        createError.BadRequest("discount_amount must be a valid number")
      );
    }

    /* ================= OPTIONAL STRINGS ================= */
    if (order_instructions && typeof order_instructions !== "string") {
      return next(
        createError.BadRequest("order_instructions must be a string")
      );
    }

    if (promo_code && typeof promo_code !== "string") {
      return next(createError.BadRequest("promo_code must be a string"));
    }

    /* ================= STATUS VALIDATION ================= */
    const validOrderStatus = ["pending", "paid", "failed", "cancelled"];
    if (order_status && !validOrderStatus.includes(order_status)) {
      return next(createError.BadRequest("Invalid order_status"));
    }

    const validStatus = [
      "pending",
      "confirmed",
      "shipped",
      "delivered",
      "cancelled",
    ];

    if (!status || !validStatus.includes(status)) {
      return next(createError.BadRequest("Invalid status"));
    }

    const sql = `insert into orders (order_number,customer_name,
      customer_email,
      customer_phone,
      customer_address,
      city,
      state,
      pincode,
      order_instructions,
      promo_code,
      discount_amount,
      subtotal,
      shipping,
      total_amount,
      payment_id,
      razorpay_order_id,
      razorpay_signature,
      order_status,
      status) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
    db.query(
      sql,
      [
        order_number,
        customer_name,
        customer_email,
        customer_phone,
        customer_address,
        city,
        state,
        pincode,
        order_instructions,
        promo_code,
        discount_amount,
        subtotal,
        shipping,
        total_amount,
        payment_id,
        razorpay_order_id,
        razorpay_signature,
        order_status,
        status,
      ],
      async (error, result) => {
        if (error) {
          return next(error);
        }
        return res.status(201).json({
          success: true,
          message: "order placed successfully",
          order_id: result.insertId,
        });
      }
    );
  } catch (error) {
    next(error);
  }
};
