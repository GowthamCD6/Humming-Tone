const db = require('../../config/db');
const createError = require('http-errors');
const jwt = require('jsonwebtoken');

/**
 * Fetch notifications for storefront / mobile app
 * Broadcast notifications (user_id IS NULL) are returned to everyone.
 * Order milestone notifications are returned ONLY to the respective user.
 * GET /user/notifications or /api/notifications
 */
exports.fetch_notifications = async (req, res, next) => {
  try {
    let userId = req.query.user_id ? Number(req.query.user_id) : null;
    let userEmail = req.query.user_email ? String(req.query.user_email).trim().toLowerCase() : null;

    // Also check Bearer token if provided
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        if (decoded?.id) userId = Number(decoded.id);
        if (decoded?.email) userEmail = String(decoded.email).trim().toLowerCase();
      } catch (tokenErr) {}
    }

    let querySql = `
      SELECT n.*, p.name as product_name, p.brand as product_brand,
             (SELECT price FROM product_variants WHERE product_id = n.product_id ORDER BY id ASC LIMIT 1) as product_price
      FROM notifications n
      LEFT JOIN products p ON n.product_id = p.id
    `;
    let countSql = `SELECT COUNT(*) as unread_count FROM notifications n`;
    const params = [];
    const countParams = [];

    if (userId || userEmail) {
      const userConditions = [];
      if (userId) {
        userConditions.push('n.user_id = ?');
        params.push(userId);
        countParams.push(userId);
      }
      if (userEmail) {
        userConditions.push('LOWER(n.user_email) = ?');
        params.push(userEmail);
        countParams.push(userEmail);
      }
      const filterClause = ` WHERE ((${userConditions.join(' OR ')}) OR (n.user_id IS NULL AND (n.user_email IS NULL OR n.user_email = '')))`;
      querySql += filterClause;
      countSql += filterClause + ' AND n.is_read = 0';
    } else {
      // Guest: only public broadcast notifications
      const filterClause = ` WHERE (n.user_id IS NULL AND (n.user_email IS NULL OR n.user_email = ''))`;
      querySql += filterClause;
      countSql += filterClause + ' AND n.is_read = 0';
    }

    querySql += ` ORDER BY n.created_at DESC LIMIT 50`;

    const [notifications] = await db.promise().query(querySql, params);
    const [unreadRows] = await db.promise().query(countSql, countParams);

    res.status(200).json({
      success: true,
      unread_count: unreadRows[0]?.unread_count || 0,
      notifications: notifications || [],
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    next(createError.InternalServerError('Failed to fetch notifications'));
  }
};

/**
 * Mark notification(s) as read
 * POST /user/notifications/mark_read or /api/notifications/mark_read
 */
exports.mark_as_read = async (req, res, next) => {
  try {
    const { id, user_id, user_email } = req.body;

    if (id) {
      await db.promise().query('UPDATE notifications SET is_read = 1 WHERE id = ?', [id]);
    } else {
      // Mark all as read for respective user / public
      let updateSql = 'UPDATE notifications SET is_read = 1 WHERE is_read = 0';
      const updateParams = [];
      if (user_id || user_email) {
        const conds = [];
        if (user_id) {
          conds.push('user_id = ?');
          updateParams.push(Number(user_id));
        }
        if (user_email) {
          conds.push('LOWER(user_email) = ?');
          updateParams.push(String(user_email).trim().toLowerCase());
        }
        updateSql += ` AND ((${conds.join(' OR ')}) OR (user_id IS NULL AND (user_email IS NULL OR user_email = '')))`;
      } else {
        updateSql += ' AND (user_id IS NULL AND (user_email IS NULL OR user_email = \'\'))';
      }
      await db.promise().query(updateSql, updateParams);
    }

    res.status(200).json({
      success: true,
      message: 'Notification(s) marked as read',
      unread_count: 0,
    });
  } catch (error) {
    console.error('Error marking notifications read:', error);
    next(createError.InternalServerError('Failed to update notification state'));
  }
};

/**
 * Create a new notification (broadcast/admin or automated event)
 * POST /api/notifications/create
 */
exports.create_notification = async (req, res, next) => {
  try {
    const { title, message, type = 'product_drop', product_id = null, order_id = null, image_url = null } = req.body;

    if (!title || !message) {
      return next(createError.BadRequest('Title and message are required'));
    }

    const [result] = await db.promise().query(
      'INSERT INTO notifications (title, message, type, product_id, order_id, image_url, is_read) VALUES (?, ?, ?, ?, ?, ?, 0)',
      [title, message, type, product_id, order_id, image_url]
    );

    res.status(201).json({
      success: true,
      id: result.insertId,
      message: 'Notification broadcasted successfully',
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    next(createError.InternalServerError('Failed to broadcast notification'));
  }
};

/**
 * Admin Daily Activity Alerts (Today's Orders, Today's Reviews, Low Stock)
 * GET /admin/activity_alerts
 */
exports.get_admin_activity_alerts = async (req, res, next) => {
  try {
    // 1. Fetch Today's Orders (or last 24h)
    const [todayOrders] = await db.promise().query(`
      SELECT o.id, o.order_number, o.customer_name, o.customer_email, o.customer_phone,
             o.total_amount, o.order_status, o.payment_status, o.created_at,
             (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count
      FROM orders o
      WHERE DATE(o.created_at) = CURDATE()
         OR o.created_at >= NOW() - INTERVAL 24 HOUR
      ORDER BY o.created_at DESC
      LIMIT 50
    `);

    // 2. Fetch Today's / Recent Customer Reviews (including pending ones)
    const [recentReviews] = await db.promise().query(`
      SELECT r.id, r.product_id, r.reviewer_name, r.reviewer_email, r.rating,
             r.title, r.comment, r.status, r.created_at,
             p.name as product_name
      FROM product_reviews r
      LEFT JOIN products p ON r.product_id = p.id
      WHERE DATE(r.created_at) = CURDATE()
         OR r.created_at >= NOW() - INTERVAL 24 HOUR
         OR r.status = 'pending'
      ORDER BY r.created_at DESC
      LIMIT 50
    `);

    // 3. Low stock inventory alerts
    const [lowStock] = await db.promise().query(`
      SELECT pv.id as variant_id, pv.product_id, pv.size, pv.color, pv.stock_quantity,
             p.name as product_name, p.brand
      FROM product_variants pv
      JOIN products p ON pv.product_id = p.id
      WHERE pv.stock_quantity <= 5 AND p.is_active = 1
      ORDER BY pv.stock_quantity ASC
      LIMIT 25
    `);

    // 4. Counts
    const todayOrdersCount = todayOrders.length;
    const pendingReviewsCount = recentReviews.filter(r => r.status === 'pending').length;
    const lowStockCount = lowStock.length;

    res.status(200).json({
      success: true,
      summary: {
        today_orders_count: todayOrdersCount,
        pending_reviews_count: pendingReviewsCount,
        low_stock_count: lowStockCount,
      },
      today_orders: todayOrders || [],
      recent_reviews: recentReviews || [],
      low_stock: lowStock || [],
    });
  } catch (error) {
    console.error('Error fetching admin activity alerts:', error);
    next(createError.InternalServerError('Failed to fetch activity alerts'));
  }
};

/**
 * Fetch all notifications for Admin Dashboard management
 * GET /admin/all_notifications
 */
exports.fetch_all_admin_notifications = async (req, res, next) => {
  try {
    const [notifications] = await db.promise().query(`
      SELECT n.*, p.name as product_name
      FROM notifications n
      LEFT JOIN products p ON n.product_id = p.id
      ORDER BY n.created_at DESC
      LIMIT 100
    `);

    res.status(200).json({
      success: true,
      notifications: notifications || [],
    });
  } catch (error) {
    console.error('Error fetching all admin notifications:', error);
    next(createError.InternalServerError('Failed to fetch notifications'));
  }
};

/**
 * Delete a notification
 * DELETE /api/notifications/:id
 */
exports.delete_notification = async (req, res, next) => {
  try {
    const { id } = req.params;
    await db.promise().query('DELETE FROM notifications WHERE id = ?', [id]);
    res.status(200).json({
      success: true,
      message: 'Notification deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    next(createError.InternalServerError('Failed to delete notification'));
  }
};

/**
 * Helper to record order milestone updates as notifications
 * Attaches user_id and user_email so order notifications are strictly private to the user.
 */
exports.sendOrderNotification = async ({ orderNumber, status, amount = 0, customerName = '', userId = null, customerEmail = '' }) => {
  try {
    let title = `Order Update: #${orderNumber}`;
    let message = `Your order #${orderNumber} status has been updated.`;
    const s = String(status || '').toLowerCase();

    if (s.includes('confirm') || s.includes('placed') || s.includes('captured')) {
      title = `Order Confirmed: #${orderNumber}`;
      message = `Thank you ${customerName || 'Patron'}! Your order #${orderNumber} for ₹${Number(amount || 0).toLocaleString('en-IN')} has been verified and sent to our atelier.`;
    } else if (s.includes('process') || s.includes('tailor') || s.includes('pack')) {
      title = `Atelier Crafting: #${orderNumber}`;
      message = `Your garments for order #${orderNumber} are undergoing precision inspection and packaging.`;
    } else if (s.includes('ship') || s.includes('transit') || s.includes('dispatch')) {
      title = `Dispatched in Transit: #${orderNumber}`;
      message = `Your order #${orderNumber} has been handed over to express courier. Tap to track real-time delivery milestones.`;
    } else if (s.includes('out_for_delivery') || s.includes('out for delivery')) {
      title = `Out for Delivery: #${orderNumber}`;
      message = `Your order #${orderNumber} is out for delivery today and will reach your address shortly.`;
    } else if (s.includes('deliver')) {
      title = `Order Delivered: #${orderNumber}`;
      message = `Your order #${orderNumber} has arrived at your doorstep. Thank you for choosing Humming Tone Atelier.`;
    } else if (s.includes('cancel')) {
      title = `Order Cancelled: #${orderNumber}`;
      message = `Order #${orderNumber} has been cancelled. If any payment was captured, refund will reflect within 3-5 business days.`;
    }

    const safeUserId = userId && !isNaN(userId) ? Number(userId) : null;
    const safeEmail = customerEmail ? String(customerEmail).trim().toLowerCase() : null;

    await db.promise().query(
      'INSERT INTO notifications (title, message, type, order_id, user_id, user_email, is_read) VALUES (?, ?, ?, ?, ?, ?, 0)',
      [title, message, 'order', String(orderNumber), safeUserId, safeEmail]
    );
  } catch (err) {
    console.warn('Failed to insert order notification:', err.message);
  }
};
