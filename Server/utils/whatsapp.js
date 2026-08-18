/**
 * WhatsApp Notification Service
 * Integrates with Meta WhatsApp Business Cloud API (Graph API)
 * with robust formatting, phone number sanitation, and fallback support.
 */

/**
 * Format phone number to strictly digits with country code (defaults to 91 for India if missing)
 * @param {string} phone 
 * @returns {string} E.164 formatted number without '+' or symbols
 */
function sanitizePhoneNumber(phone) {
  if (!phone) return "";
  let cleaned = String(phone).replace(/\D/g, ""); // strip non-digits

  // If 10 digits (typical Indian mobile), prepend country code 91
  if (cleaned.length === 10) {
    cleaned = `91${cleaned}`;
  } else if (cleaned.length === 11 && cleaned.startsWith("0")) {
    cleaned = `91${cleaned.substring(1)}`;
  }
  return cleaned;
}

/**
 * Format date for display in WhatsApp message
 */
function formatDate(dateStr) {
  if (!dateStr) return "To be updated soon";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return String(dateStr);
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  } catch (e) {
    return String(dateStr);
  }
}

/**
 * Send WhatsApp Template Message using Meta WhatsApp Business Cloud API
 * @param {Object} params
 * @param {string} params.to - Recipient phone number
 * @param {string} params.template - Meta pre-approved template name
 * @param {Array<string>} params.bodyVariables - Ordered variables for template body
 * @param {string} [params.languageCode='en_US'] - Language code
 */
async function sendMetaTemplateMessage({ to, template, bodyVariables = [], languageCode = "en_US" }) {
  const sanitizedTo = sanitizePhoneNumber(to);
  if (!sanitizedTo) {
    throw new Error("Invalid phone number provided for WhatsApp notification");
  }

  const phoneNumberId = process.env.META_PHONE_NUMBER_ID || process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.META_ACCESS_TOKEN || process.env.WHATSAPP_ACCESS_TOKEN;

  if (!phoneNumberId || !accessToken) {
    console.warn("⚠️ [WhatsApp Service] Meta WhatsApp API credentials not configured in .env (META_PHONE_NUMBER_ID / META_ACCESS_TOKEN).");
    return {
      success: false,
      mock: true,
      reason: "MISSING_CREDENTIALS",
      message: "Meta WhatsApp credentials not found in environment variables",
      recipient: sanitizedTo,
      template,
      bodyVariables
    };
  }

  const metaUrl = `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`;

  const formattedParameters = bodyVariables.map((val) => ({
    type: "text",
    text: String(val ?? "")
  }));

  const payload = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: sanitizedTo,
    type: "template",
    template: {
      name: template,
      language: { code: languageCode },
      components: [
        {
          type: "body",
          parameters: formattedParameters
        }
      ]
    }
  };

  try {
    const response = await fetch(metaUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ [WhatsApp Meta Error]:", data);
      return {
        success: false,
        error: data.error?.message || "Meta API responded with error",
        raw: data
      };
    }

    console.log(`✅ [WhatsApp Meta Sent]: Message ID ${data.messages?.[0]?.id} sent to ${sanitizedTo}`);
    return {
      success: true,
      messageId: data.messages?.[0]?.id,
      recipient: sanitizedTo,
      data
    };
  } catch (err) {
    console.error("❌ [WhatsApp Network Error]:", err.message);
    return {
      success: false,
      error: err.message
    };
  }
}

/**
 * Send Free-Form Text Message (Applicable for customer service window / testing)
 */
async function sendMetaTextMessage({ to, textMessage }) {
  const sanitizedTo = sanitizePhoneNumber(to);
  const phoneNumberId = process.env.META_PHONE_NUMBER_ID || process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.META_ACCESS_TOKEN || process.env.WHATSAPP_ACCESS_TOKEN;

  if (!phoneNumberId || !accessToken) {
    return {
      success: false,
      mock: true,
      reason: "MISSING_CREDENTIALS",
      recipient: sanitizedTo,
      textMessage
    };
  }

  const metaUrl = `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`;

  const payload = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: sanitizedTo,
    type: "text",
    text: {
      preview_url: true,
      body: textMessage
    }
  };

  try {
    const response = await fetch(metaUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (!response.ok) {
      return { success: false, error: data.error?.message || "Meta API error", raw: data };
    }
    return { success: true, messageId: data.messages?.[0]?.id, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * High-level trigger: Send Order Confirmation via WhatsApp
 * @param {Object} order - Order details
 */
async function sendOrderConfirmationWhatsApp(order) {
  if (!order || !order.customer_phone) {
    console.log("⚠️ [WhatsApp] No customer phone for order confirmation notification.");
    return { success: false, error: "No customer phone provided" };
  }

  const templateName = process.env.WHATSAPP_TEMPLATE_ORDER_CONFIRMATION || "order_confirmation";
  const customerName = order.customer_name || "Customer";
  const orderNumber = order.order_number || `#${order.id}`;
  const totalAmount = `₹${parseFloat(order.total_amount || 0).toFixed(2)}`;
  const deliveryInfo = formatDate(order.delivery_date);

  // Template Body Variables: [Customer Name, Order Number, Total Amount, Estimated Delivery Date]
  const templateVars = [customerName, orderNumber, totalAmount, deliveryInfo];

  console.log(`🚀 [WhatsApp] Triggering Order Confirmation to ${order.customer_phone} for Order ${orderNumber}`);

  const res = await sendMetaTemplateMessage({
    to: order.customer_phone,
    template: templateName,
    bodyVariables: templateVars
  });

  // If template is missing or in dev mock mode, also build readable text for log / fallback
  const fallbackText = 
`🎉 *Order Confirmed! - Humming & Tone*

Hello ${customerName},
Thank you for your order! Your payment has been received and order has been confirmed.

📦 *Order Number:* ${orderNumber}
💰 *Total Amount:* ${totalAmount}
📅 *Expected Delivery:* ${deliveryInfo}

Track your order anytime:
${process.env.STORE_TRACKING_URL || "http://localhost:5173/usertab/track-order"}

Need help? Reply directly to this WhatsApp message!`;

  return {
    ...res,
    previewText: fallbackText,
    directWhatsAppLink: `https://wa.me/${sanitizePhoneNumber(order.customer_phone)}?text=${encodeURIComponent(fallbackText)}`
  };
}

/**
 * High-level trigger: Send Delivery / Status Update via WhatsApp
 * @param {Object} order - Order record
 * @param {Object} options - { status, shipping_date, delivery_date }
 */
async function sendOrderStatusUpdateWhatsApp(order, { status, shipping_date, delivery_date } = {}) {
  const phone = order.customer_phone;
  if (!phone) {
    return { success: false, error: "No customer phone provided" };
  }

  const currentStatus = (status || order.order_status || "updated").toUpperCase().replace(/_/g, " ");
  const templateName = process.env.WHATSAPP_TEMPLATE_ORDER_UPDATE || "order_status_update";
  const customerName = order.customer_name || "Customer";
  const orderNumber = order.order_number || `#${order.id}`;
  const displayDelivery = formatDate(delivery_date || order.delivery_date);
  const displayShipping = formatDate(shipping_date || order.shipping_date);

  // Template Body Variables: [Customer Name, Order Number, Status, Delivery Date]
  const templateVars = [customerName, orderNumber, currentStatus, displayDelivery];

  console.log(`🚀 [WhatsApp] Triggering Status Update (${currentStatus}) to ${phone} for Order ${orderNumber}`);

  const res = await sendMetaTemplateMessage({
    to: phone,
    template: templateName,
    bodyVariables: templateVars
  });

  const fallbackText = 
`🚚 *Order Status Update - Humming & Tone*

Hello ${customerName},
Your order *#${orderNumber}* status has been updated!

🏷️ *Status:* ${currentStatus}
📅 *Shipping Date:* ${displayShipping}
📦 *Expected Delivery:* ${displayDelivery}

Track your shipment progress live here:
${process.env.STORE_TRACKING_URL || "http://localhost:5173/usertab/track-order"}

Thank you for choosing Humming & Tone!`;

  return {
    ...res,
    previewText: fallbackText,
    directWhatsAppLink: `https://wa.me/${sanitizePhoneNumber(phone)}?text=${encodeURIComponent(fallbackText)}`
  };
}

module.exports = {
  sanitizePhoneNumber,
  formatDate,
  sendMetaTemplateMessage,
  sendMetaTextMessage,
  sendOrderConfirmationWhatsApp,
  sendOrderStatusUpdateWhatsApp
};
