const db = require("../../config/db");
const createError = require("http-errors");
const { sanitizeText } = require("../../utils/sanitize");

/**
 * Submit a verified return request
 * Protected by userAuth middleware
 */
exports.return_request = async (req, res, next) => {
  try {
    const userId = req.userId || req.user?.id;
    const userEmail = (req.userEmail || req.user?.email || '').trim().toLowerCase();

    if (!userId && !userEmail) {
      return next(createError.Unauthorized("Authentication required to submit return request"));
    }

    const {
      order_id,
      order_item_id,
      product_id,
      return_quantity,
      return_reason,
      return_description
    } = req.body;

    const numOrderId = parseInt(order_id, 10);
    const numItemId = parseInt(order_item_id, 10);
    const numProductId = parseInt(product_id, 10);
    const numQty = parseInt(return_quantity, 10);

    if (isNaN(numOrderId) || isNaN(numItemId) || isNaN(numQty) || numQty <= 0) {
      return next(createError.BadRequest("Invalid order, item, or quantity"));
    }

    const cleanReason = sanitizeText(return_reason, 100);
    const cleanDescription = sanitizeText(return_description, 1000);

    if (!cleanReason) {
      return next(createError.BadRequest("Return reason is required"));
    }
    if (!cleanDescription || cleanDescription.length < 5) {
      return next(createError.BadRequest("Please provide a description of at least 5 characters"));
    }

    // 1. Verify Order Ownership & Status
    const [orderRows] = await db.promise().query(
      `SELECT id, order_number, user_id, customer_email, order_status, payment_status 
       FROM orders 
       WHERE id = ? AND (user_id = ? OR LOWER(customer_email) = ?) 
       LIMIT 1`,
      [numOrderId, userId || 0, userEmail]
    );

    if (!orderRows || orderRows.length === 0) {
      return next(createError.Forbidden("Order not found or unauthorized to request return"));
    }

    const order = orderRows[0];

    // Only delivered orders can be requested for return
    if (order.order_status !== "delivered") {
      return next(
        createError.BadRequest(
          `Returns are only allowed for delivered orders. Current status: ${order.order_status}`
        )
      );
    }

    // 2. Verify Order Item belongs to this Order
    const [itemRows] = await db.promise().query(
      `SELECT id, order_id, product_id, product_price, quantity 
       FROM order_items 
       WHERE id = ? AND order_id = ? 
       LIMIT 1`,
      [numItemId, numOrderId]
    );

    if (!itemRows || itemRows.length === 0) {
      return next(createError.BadRequest("Specified order item does not exist in this order"));
    }

    const item = itemRows[0];

    // Check quantity validity
    if (numQty > item.quantity) {
      return next(
        createError.BadRequest(
          `Return quantity (${numQty}) cannot exceed ordered quantity (${item.quantity})`
        )
      );
    }

    // 3. Prevent duplicate active return requests
    const [existingReturns] = await db.promise().query(
      `SELECT id, status FROM return_requests 
       WHERE order_item_id = ? AND status NOT IN ('rejected', 'cancelled') 
       LIMIT 1`,
      [numItemId]
    );

    if (existingReturns && existingReturns.length > 0) {
      return next(
        createError.BadRequest(
          "An active return request already exists for this item"
        )
      );
    }

    // 4. Calculate Verified Refund Amount Server-Side (PREVENTS PRICE TAMPERING)
    const unitPrice = Number(item.product_price || 0);
    const verifiedRefundAmount = Math.round(unitPrice * numQty * 100) / 100;

    // 5. Insert verified return request
    const insertSql = `
      INSERT INTO return_requests 
      (order_id, order_item_id, product_id, return_quantity, return_reason, return_description, refund_amount, status) 
      VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
    `;

    const [result] = await db.promise().query(insertSql, [
      numOrderId,
      numItemId,
      item.product_id || numProductId || null,
      numQty,
      cleanReason,
      cleanDescription,
      verifiedRefundAmount
    ]);

    return res.status(201).json({
      success: true,
      message: "Your return request has been submitted successfully and is pending review.",
      return_id: result.insertId,
      refund_amount: verifiedRefundAmount
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Fetch status of a return request
 * IDOR-safe: restricts lookup to order owner
 */
exports.get_return_request_status = async (req, res, next) => {
  try {
    const { id } = req.params;
    const reqId = parseInt(id, 10);
    const userId = req.userId || req.user?.id;
    const userEmail = (req.userEmail || req.user?.email || '').trim().toLowerCase();

    if (!reqId || isNaN(reqId)) {
      return next(createError.BadRequest("Invalid return request ID"));
    }

    const sql = `
      SELECT rr.*, o.order_number, o.order_status, o.customer_name
      FROM return_requests rr
      JOIN orders o ON o.id = rr.order_id
      WHERE rr.id = ? AND (o.user_id = ? OR LOWER(o.customer_email) = ?)
      LIMIT 1
    `;

    const [rows] = await db.promise().query(sql, [reqId, userId || 0, userEmail]);

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
