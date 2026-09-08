const db = require("../../config/db");
const createError = require("http-errors");

// Get list of all customized orders with search, filtering, and stats
exports.getCustomizedOrders = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let conditions = [];
    let params = [];

    if (status && status !== 'all' && status !== 'All') {
      conditions.push("co.status = ?");
      params.push(status.toLowerCase());
    }

    if (search && search.trim()) {
      const s = `%${search.trim()}%`;
      conditions.push("(co.order_number LIKE ? OR co.customer_name LIKE ? OR co.customer_email LIKE ? OR co.customer_phone LIKE ?)");
      params.push(s, s, s, s);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const listQuery = `
      SELECT 
        co.*,
        o.order_status AS parent_order_status,
        o.payment_status,
        o.payment_id,
        o.created_at AS order_created_at
      FROM customized_orders co
      LEFT JOIN orders o ON o.id = co.order_id
      ${whereClause}
      ORDER BY co.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const countQuery = `
      SELECT COUNT(*) AS total
      FROM customized_orders co
      ${whereClause}
    `;

    const [rows] = await db.promise().query(listQuery, [...params, Number(limit), Number(offset)]);
    const [countRows] = await db.promise().query(countQuery, params);

    // KPI Metrics
    const [metricsRows] = await db.promise().query(`
      SELECT 
        COUNT(*) AS total_custom_orders,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending_count,
        SUM(CASE WHEN status = 'in_production' THEN 1 ELSE 0 END) AS in_production_count,
        SUM(CASE WHEN status = 'packed' OR status = 'shipped' THEN 1 ELSE 0 END) AS dispatched_count,
        SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) AS delivered_count,
        IFNULL(SUM(total_price), 0) AS total_custom_revenue
      FROM customized_orders
    `);

    res.status(200).json({
      success: true,
      orders: rows || [],
      pagination: {
        total: countRows[0]?.total || 0,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil((countRows[0]?.total || 0) / Number(limit))
      },
      metrics: metricsRows[0] || {}
    });
  } catch (error) {
    console.error("Error fetching customized orders:", error);
    next(error);
  }
};

// Get single customized order with full specifications
exports.getCustomizedOrderDetail = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) {
      return next(createError.BadRequest("Order ID is required"));
    }

    const [rows] = await db.promise().query(
      `
      SELECT 
        co.*,
        o.order_status AS parent_order_status,
        o.payment_status,
        o.payment_id,
        o.payment_verified,
        o.order_instructions,
        o.shipping,
        o.gst_amount,
        o.shipping_date,
        o.delivery_date,
        o.tracking_number,
        o.courier_partner
      FROM customized_orders co
      LEFT JOIN orders o ON o.id = co.order_id
      WHERE co.id = ? OR co.order_number = ?
      LIMIT 1
      `,
      [id, id]
    );

    if (rows.length === 0) {
      return next(createError.NotFound("Customized order record not found"));
    }

    res.status(200).json({
      success: true,
      order: rows[0]
    });
  } catch (error) {
    console.error("Error fetching customized order detail:", error);
    next(error);
  }
};

// Update customized order status
exports.updateCustomizedOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
      'pending', 'confirmed', 'in_production', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'
    ];

    if (!id || !status || !allowedStatuses.includes(status.toLowerCase())) {
      return next(createError.BadRequest("Valid ID and status are required"));
    }

    const [orderRows] = await db.promise().query(
      "SELECT id, order_id, order_number FROM customized_orders WHERE id = ?",
      [id]
    );

    if (orderRows.length === 0) {
      return next(createError.NotFound("Customized order not found"));
    }

    await db.promise().query(
      "UPDATE customized_orders SET status = ? WHERE id = ?",
      [status.toLowerCase(), id]
    );

    // Optionally synchronize with parent order status if appropriate
    const parentStatusMap = {
      'confirmed': 'confirmed',
      'in_production': 'confirmed',
      'packed': 'packed',
      'shipped': 'shipped',
      'out_for_delivery': 'out_for_delivery',
      'delivered': 'delivered',
      'cancelled': 'cancelled'
    };

    if (parentStatusMap[status.toLowerCase()] && orderRows[0].order_id) {
      await db.promise().query(
        "UPDATE orders SET order_status = ? WHERE id = ?",
        [parentStatusMap[status.toLowerCase()], orderRows[0].order_id]
      );
    }

    res.status(200).json({
      success: true,
      message: `Customized order #${orderRows[0].order_number} status updated to ${status}`
    });
  } catch (error) {
    console.error("Error updating customized order status:", error);
    next(error);
  }
};
