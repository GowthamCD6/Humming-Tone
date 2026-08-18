const db = require("../../config/db");
const createError = require("http-errors");
const {
  sendMetaTemplateMessage,
  sendMetaTextMessage,
  sendOrderConfirmationWhatsApp,
  sendOrderStatusUpdateWhatsApp,
  sanitizePhoneNumber
} = require("../../utils/whatsapp");

/**
 * Send manual or triggered WhatsApp update from Admin panel
 */
exports.sendOrderWhatsAppNotification = async (req, res, next) => {
  try {
    const { orderId, type = "update", customMessage } = req.body;

    if (!orderId) {
      return next(createError.BadRequest("Order ID is required"));
    }

    const [rows] = await db.promise().query(
      `SELECT * FROM orders WHERE id = ? LIMIT 1`,
      [orderId]
    );

    if (rows.length === 0) {
      return next(createError.NotFound("Order not found"));
    }

    const order = rows[0];

    if (!order.customer_phone) {
      return res.status(400).json({
        success: false,
        message: "Customer does not have a valid phone number on file."
      });
    }

    let result;
    if (type === "confirmation") {
      result = await sendOrderConfirmationWhatsApp(order);
    } else if (type === "custom" && customMessage) {
      result = await sendMetaTextMessage({
        to: order.customer_phone,
        textMessage: customMessage
      });
    } else {
      // Default: Status & Delivery Update
      result = await sendOrderStatusUpdateWhatsApp(order, {
        status: order.order_status,
        shipping_date: order.shipping_date,
        delivery_date: order.delivery_date
      });
    }

    res.status(200).json({
      success: true,
      message: "WhatsApp notification dispatched",
      result
    });
  } catch (error) {
    console.error("WhatsApp Send Error:", error);
    next(error);
  }
};

/**
 * Check Meta WhatsApp API configuration status
 */
exports.getWhatsAppConfigStatus = (req, res) => {
  const phoneNumberId = process.env.META_PHONE_NUMBER_ID || process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.META_ACCESS_TOKEN || process.env.WHATSAPP_ACCESS_TOKEN;

  res.status(200).json({
    configured: Boolean(phoneNumberId && accessToken),
    phoneNumberId: phoneNumberId ? `***${phoneNumberId.slice(-4)}` : null,
    templateConfirmation: process.env.WHATSAPP_TEMPLATE_ORDER_CONFIRMATION || "order_confirmation",
    templateUpdate: process.env.WHATSAPP_TEMPLATE_ORDER_UPDATE || "order_status_update"
  });
};
