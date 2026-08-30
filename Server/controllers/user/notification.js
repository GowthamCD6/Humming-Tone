const db = require('../../config/db');
const createError = require('http-errors');

/**
 * Fetch all notifications for the storefront / mobile app
 * GET /user/notifications or /api/notifications
 */
exports.fetch_notifications = async (req, res, next) => {
  try {
    const [notifications] = await db.promise().query(
      `SELECT n.*, p.name as product_name, p.brand as product_brand,
              (SELECT price FROM product_variants WHERE product_id = n.product_id ORDER BY id ASC LIMIT 1) as product_price
       FROM notifications n
       LEFT JOIN products p ON n.product_id = p.id
       ORDER BY n.created_at DESC
       LIMIT 50`
    );

    const [unreadRows] = await db.promise().query(
      'SELECT COUNT(*) as unread_count FROM notifications WHERE is_read = 0'
    );

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
    const { id } = req.body;

    if (id) {
      await db.promise().query('UPDATE notifications SET is_read = 1 WHERE id = ?', [id]);
    } else {
      // Mark all as read
      await db.promise().query('UPDATE notifications SET is_read = 1 WHERE is_read = 0');
    }

    const [unreadRows] = await db.promise().query(
      'SELECT COUNT(*) as unread_count FROM notifications WHERE is_read = 0'
    );

    res.status(200).json({
      success: true,
      message: 'Notification(s) marked as read',
      unread_count: unreadRows[0]?.unread_count || 0,
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
 * Helper to record order milestone updates as notifications
 */
exports.sendOrderNotification = async ({ orderNumber, status, amount = 0, customerName = '' }) => {
  try {
    let title = `📦 Order Update: #${orderNumber}`;
    let message = `Your order #${orderNumber} status has been updated.`;
    const s = String(status || '').toLowerCase();

    if (s.includes('confirm') || s.includes('placed') || s.includes('created')) {
      title = `📦 Order Confirmed: #${orderNumber}`;
      message = `Thank you ${customerName || 'Patron'}! Your order #${orderNumber} for ₹${Number(amount || 0).toLocaleString('en-IN')} has been verified and sent to our atelier.`;
    } else if (s.includes('process') || s.includes('tailor') || s.includes('pack')) {
      title = `✨ Atelier Crafting: #${orderNumber}`;
      message = `Your garments for order #${orderNumber} are undergoing precision inspection and packaging.`;
    } else if (s.includes('ship') || s.includes('transit') || s.includes('dispatch')) {
      title = `🚚 Dispatched in Transit: #${orderNumber}`;
      message = `Your order #${orderNumber} has been handed over to express courier. Tap to track real-time delivery milestones.`;
    } else if (s.includes('deliver')) {
      title = `🎉 Order Delivered: #${orderNumber}`;
      message = `Your order #${orderNumber} has arrived at your doorstep. Thank you for choosing Humming Tone Atelier.`;
    } else if (s.includes('cancel')) {
      title = `⚠️ Order Cancelled: #${orderNumber}`;
      message = `Order #${orderNumber} has been cancelled. If any refund is due, it will reflect within 3-5 business days.`;
    }

    await db.promise().query(
      'INSERT INTO notifications (title, message, type, order_id, is_read) VALUES (?, ?, ?, ?, 0)',
      [title, message, 'order_update', orderNumber]
    );
  } catch (err) {
    console.warn('Failed to insert order notification:', err.message);
  }
};
