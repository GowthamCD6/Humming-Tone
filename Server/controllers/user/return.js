const db = require("../../config/db");
const createError = require("http-errors");
const { sanitizeText } = require("../../utils/sanitize");

/**
 * Submit a verified return/exchange request
 * Supports both authenticated users and guest verified lookups
 */
exports.return_request = async (req, res, next) => {
  try {
    const userId = req.userId || req.user?.id || null;
    const userEmail = (req.userEmail || req.user?.email || '').trim().toLowerCase();

    const {
      order_id,
      orderId,
      order_number,
      orderNumber,
      order_item_id,
      orderItemId,
      product_id,
      productId,
      return_quantity,
      returnQuantity,
      quantity,
      return_reason,
      reason,
      return_description,
      comments,
      email,
      phone
    } = req.body;

    const rawOrderRef = order_id || orderId || order_number || orderNumber;
    const rawItemId = order_item_id || orderItemId;
    const rawProductId = product_id || productId;
    const numQty = parseInt(return_quantity || returnQuantity || quantity || 1, 10);

    if (!rawOrderRef) {
      return next(createError.BadRequest("Order reference or Order ID is required"));
    }

    const cleanReason = sanitizeText(return_reason || reason, 100);
    const cleanDescription = sanitizeText(return_description || comments || "Standard return request", 1000);

    if (!cleanReason) {
      return next(createError.BadRequest("Return reason is required"));
    }

    // 1. Locate Order by ID or Order Number
    let orderSql = `
      SELECT id, order_number, user_id, customer_email, customer_phone, order_status, payment_status 
      FROM orders 
      WHERE (id = ? OR order_number = ?)
    `;
    const orderParams = [isNaN(Number(rawOrderRef)) ? 0 : Number(rawOrderRef), String(rawOrderRef)];

    if (userId) {
      orderSql += ` AND (user_id = ? OR LOWER(customer_email) = ?)`;
      orderParams.push(userId, userEmail);
    } else if (email) {
      orderSql += ` AND LOWER(customer_email) = ?`;
      orderParams.push(String(email).trim().toLowerCase());
    }

    orderSql += ` LIMIT 1`;

    const [orderRows] = await db.promise().query(orderSql, orderParams);

    if (!orderRows || orderRows.length === 0) {
      return next(createError.Forbidden("Order not found or unauthorized to request return"));
    }

    const order = orderRows[0];
    const resolvedOrderId = order.id;

    // 2. Locate or Resolve Order Item
    let itemRows = [];
    if (rawItemId && !isNaN(Number(rawItemId))) {
      [itemRows] = await db.promise().query(
        `SELECT id, order_id, product_id, product_price, quantity 
         FROM order_items 
         WHERE id = ? AND order_id = ? 
         LIMIT 1`,
        [Number(rawItemId), resolvedOrderId]
      );
    } else if (rawProductId && !isNaN(Number(rawProductId))) {
      [itemRows] = await db.promise().query(
        `SELECT id, order_id, product_id, product_price, quantity 
         FROM order_items 
         WHERE product_id = ? AND order_id = ? 
         LIMIT 1`,
        [Number(rawProductId), resolvedOrderId]
      );
    } else {
      [itemRows] = await db.promise().query(
        `SELECT id, order_id, product_id, product_price, quantity 
         FROM order_items 
         WHERE order_id = ? 
         LIMIT 1`,
        [resolvedOrderId]
      );
    }

    if (!itemRows || itemRows.length === 0) {
      return next(createError.BadRequest("No matching items found for this order"));
    }

    const item = itemRows[0];
    const validQty = Math.min(Math.max(1, numQty), item.quantity || 1);

    // 3. Prevent duplicate active return requests
    const [existingReturns] = await db.promise().query(
      `SELECT id, return_status FROM return_requests 
       WHERE order_id = ? AND order_item_id = ? AND return_status NOT IN ('rejected', 'cancelled') 
       LIMIT 1`,
      [resolvedOrderId, item.id]
    );

    if (existingReturns && existingReturns.length > 0) {
      return next(
        createError.BadRequest(
          "An active return request already exists for this order item"
        )
      );
    }

    // 4. Calculate Verified Refund Amount
    const unitPrice = Number(item.product_price || 0);
    const verifiedRefundAmount = Math.round(unitPrice * validQty * 100) / 100;

    // 5. Insert verified return request
    const insertSql = `
      INSERT INTO return_requests 
      (order_id, order_item_id, product_id, return_quantity, return_reason, return_description, refund_amount, return_status) 
      VALUES (?, ?, ?, ?, ?, ?, ?, 'requested')
    `;

    const [result] = await db.promise().query(insertSql, [
      resolvedOrderId,
      item.id,
      item.product_id || null,
      validQty,
      cleanReason,
      cleanDescription,
      verifiedRefundAmount
    ]);

    return res.status(201).json({
      success: true,
      message: "Your return request has been submitted successfully and is pending review.",
      return_id: result.insertId,
      order_number: order.order_number,
      refund_amount: verifiedRefundAmount
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Fetch status of a return request
 */
exports.get_return_request_status = async (req, res, next) => {
  try {
    const { id } = req.params;
    const reqId = parseInt(id, 10);
    const userId = req.userId || req.user?.id || null;
    const userEmail = (req.userEmail || req.user?.email || '').trim().toLowerCase();

    if (!reqId || isNaN(reqId)) {
      return next(createError.BadRequest("Invalid return request ID"));
    }

    let sql = `
      SELECT rr.*, o.order_number, o.order_status, o.customer_name, o.customer_email,
             p.product_name, p.product_images, oi.product_size, oi.product_color
      FROM return_requests rr
      JOIN orders o ON o.id = rr.order_id
      LEFT JOIN order_items oi ON oi.id = rr.order_item_id
      LEFT JOIN products p ON p.id = rr.product_id OR p.id = oi.product_id
      WHERE rr.id = ?
    `;
    const params = [reqId];

    if (userId) {
      sql += ` AND (o.user_id = ? OR LOWER(o.customer_email) = ?)`;
      params.push(userId, userEmail);
    }

    sql += ` LIMIT 1`;

    const [rows] = await db.promise().query(sql, params);

    if (!rows || rows.length === 0) {
      return next(createError.NotFound("Return request not found or unauthorized"));
    }

    return res.status(200).json({
      success: true,
      return_request: rows[0]
    });
  } catch (error) {
    next(error);
  }
};
