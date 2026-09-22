const db = require("../../config/db");
const createError = require("http-errors");

/**
 * Fetch all return requests with detailed customer, order, and product information
 */
exports.get_return_requests = async (req, res, next) => {
  try {
    const statusFilter = req.query.status;
    let sql = `
      SELECT 
        rr.id,
        rr.order_id,
        rr.order_item_id,
        rr.product_id,
        rr.return_quantity,
        rr.return_reason,
        rr.return_description,
        rr.return_status,
        rr.refund_amount,
        rr.created_at,
        rr.updated_at,
        o.order_number,
        o.customer_name,
        o.customer_email,
        o.customer_phone,
        o.order_status,
        o.payment_status,
        o.total_amount,
        p.product_name,
        p.product_images,
        p.product_price,
        oi.product_size,
        oi.product_color,
        oi.quantity as ordered_quantity
      FROM return_requests rr
      LEFT JOIN orders o ON o.id = rr.order_id
      LEFT JOIN order_items oi ON oi.id = rr.order_item_id
      LEFT JOIN products p ON p.id = rr.product_id OR p.id = oi.product_id
    `;
    const params = [];
    if (statusFilter && statusFilter !== 'all') {
      sql += ` WHERE rr.return_status = ?`;
      params.push(statusFilter);
    }
    sql += ` ORDER BY rr.created_at DESC`;

    const [rows] = await db.promise().query(sql, params);
    return res.status(200).json({
      success: true,
      returns: rows || []
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update the status of a return request
 */
exports.change_status = async (req, res, next) => {
  try {
    const { id, status } = req.body;
    const reqId = parseInt(id, 10);
    if (!reqId || isNaN(reqId)) {
      return next(createError.BadRequest("Invalid return request ID"));
    }

    const normalizedStatus = String(status).toLowerCase();
    if (!['requested', 'approved', 'rejected', 'completed'].includes(normalizedStatus)) {
      return next(createError.BadRequest("Invalid return status"));
    }

    const sql = `UPDATE return_requests SET return_status = ? WHERE id = ?`;
    const [result] = await db.promise().query(sql, [normalizedStatus, reqId]);

    if (result.affectedRows === 0) {
      return next(createError.NotFound("Return request not found"));
    }

    return res.status(200).json({
      success: true,
      message: `Return request #${reqId} status updated to ${normalizedStatus}`,
      status: normalizedStatus,
      id: reqId
    });
  } catch (error) {
    next(error);
  }
};


