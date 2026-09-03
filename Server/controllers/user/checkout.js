const db = require("../../config/db.js");
const createError = require("http-errors");
const crypto = require("crypto");
const razorpayInstance = require("../../utils/rajorpay.js");
const { sendOrderConfirmationWhatsApp } = require("../../utils/whatsapp.js");
const { sendOrderNotification } = require("./notification.js");

exports.create_order = (req, res, next) => {
  db.getConnection((err, connection) => {
    if (err) return next(err);

    connection.beginTransaction(async (err) => {
      if (err) {
        connection.release();
        return next(err);
      }

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
          discount_amount = 0,
          shipping = 0,
          user_id = null,
          items
        } = req.body;

        if (!customer_name || !customer_email || !customer_phone || customer_email.toLowerCase().includes('guest@')) {
          throw createError.BadRequest("A valid authenticated customer account is required to place an order");
        }

        if (!Array.isArray(items) || items.length === 0) {
          throw createError.BadRequest("Order items are required");
        }

        const allowedSizes = [
          'XS','S','M','L','XL','XXL','XXXL','4XL','5XL',
          'Standard','Free Size','ONESIZE','OS','One Size','Custom',
          '28','30','32','34','36','38','40','42','44',
          '6','7','8','9','10','11','12'
        ];
        let subtotal = 0;

        for (const item of items) {
          const { product_id, quantity, size = 'M' } = item;

          if (!product_id || !quantity || quantity <= 0) {
            throw createError.BadRequest("Invalid cart item");
          }

          const cleanSize = (size || 'M').trim();

          let [rows] = await connection.promise().query(
            `
            SELECT 
              v.id   AS variant_id,
              v.price,
              p.name AS product_name
            FROM product_variants v
            JOIN products p ON p.id = v.product_id
            WHERE v.product_id = ? AND v.size = ?
            LIMIT 1
            `,
            [product_id, cleanSize]
          );

          // Fallback: If exact size variant not found, check any variant for this product
          if (rows.length === 0) {
            [rows] = await connection.promise().query(
              `
              SELECT 
                v.id   AS variant_id,
                v.price,
                p.name AS product_name
              FROM product_variants v
              JOIN products p ON p.id = v.product_id
              WHERE v.product_id = ?
              LIMIT 1
              `,
              [product_id]
            );
          }

          // Fallback 2: Check products table directly
          if (rows.length === 0) {
            const [prodRows] = await connection.promise().query(
              `SELECT id AS product_id, price, name AS product_name FROM products WHERE id = ? LIMIT 1`,
              [product_id]
            );
            if (prodRows.length > 0) {
              rows = [{
                variant_id: null,
                price: Number(prodRows[0].price || 0),
                product_name: prodRows[0].product_name
              }];
            }
          }

          if (rows.length === 0) {
            throw createError.BadRequest(`Product #${product_id} not found in catalog`);
          }

          const { price, variant_id, product_name } = rows[0];

          subtotal += Number(price || 0) * quantity;

          // attach verified data
          item._verified_price = Number(price || 0);
          item._variant_id = variant_id || null;
          item._product_name = product_name;
        }

        // Fetch dynamic site settings (gst_rate and shipping_fee)
        const [settingsRows] = await connection.promise().query(
          "SELECT shipping_fee, gst_rate FROM site_settings WHERE id = 1"
        );
        const settings = settingsRows[0] || {};
        const configuredGstRate = Number(settings.gst_rate != null ? settings.gst_rate : 5);
        const configuredShipping = Number(settings.shipping_fee != null ? settings.shipping_fee : 0);

        const safeDiscount = Math.min(discount_amount || 0, subtotal);
        const netAmount = Math.max(subtotal - safeDiscount, 0);
        
        // Price is inclusive of GST: Included GST = netAmount - (netAmount / (1 + rate/100))
        const gst_amount = Math.round((netAmount - (netAmount / (1 + configuredGstRate / 100))) * 100) / 100;
        const finalShipping = Number(shipping != null ? shipping : configuredShipping);
        const total_amount = Math.round((netAmount + finalShipping) * 100) / 100;

        if (total_amount <= 0) {
          throw createError.BadRequest("Invalid total amount");
        }

        const razorpayOrder = await razorpayInstance.orders.create({
          amount: Math.round(total_amount * 100), // paise
          currency: "INR",
          receipt: order_number,
          payment_capture: 1,
          notes: {
            customer_name,
            customer_email,
            customer_phone
          }
        });

        if (!razorpayOrder || !razorpayOrder.id) {
          throw createError.ServiceUnavailable("Payment gateway error");
        }

        connection.query(
          `
          INSERT INTO orders (
            order_number,
            user_id,
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
            gst_amount,
            total_amount,
            razorpay_order_id,
            order_status
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
          `,
          [
            order_number,
            user_id ? Number(user_id) : null,
            customer_name,
            customer_email,
            customer_phone,
            customer_address,
            city,
            state,
            pincode,
            order_instructions || null,
            promo_code || null,
            safeDiscount,
            subtotal,
            shipping,
            gst_amount,
            total_amount,
            razorpayOrder.id
          ],
          (err, orderResult) => {
            if (err) {
              return connection.rollback(() => {
                connection.release();
                next(err);
              });
            }

            const orderId = orderResult.insertId;

            const itemPromises = items.map(item =>
              connection.promise().query(
                `
                INSERT INTO order_items (
                  order_id,
                  product_id,
                  variant_id,
                  product_name,
                  product_price,
                  quantity,
                  size,
                  color
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                `,
                [
                  orderId,
                  item.product_id,
                  item._variant_id,
                  item._product_name,
                  item._verified_price,
                  item.quantity,
                  item.size,
                  item.color || null
                ]
              )
            );

            Promise.all(itemPromises)
              .then(() => {
                connection.commit(err => {
                  if (err) {
                    return connection.rollback(() => {
                      connection.release();
                      next(err);
                    });
                  }

                  // Auto-update user's saved shipping address in users table
                  if (user_id || customer_email) {
                    db.promise().query(
                      `UPDATE users 
                       SET name = COALESCE(NULLIF(?, ''), name),
                           phone = COALESCE(NULLIF(?, ''), phone), 
                           address = COALESCE(NULLIF(?, ''), address), 
                           city = COALESCE(?, city), 
                           state = COALESCE(?, state), 
                           pincode = COALESCE(?, pincode) 
                       WHERE id = ? OR LOWER(email) = LOWER(?)`,
                      [
                        customer_name || "",
                        customer_phone || "",
                        customer_address || "",
                        city || "",
                        state || "",
                        pincode || "",
                        user_id && !isNaN(user_id) ? Number(user_id) : -1,
                        customer_email || ""
                      ]
                    ).catch(e => console.warn("Auto-save user address error:", e.message));
                  }

                  // Trigger order confirmation notification
                  sendOrderNotification({
                    orderNumber: order_number,
                    status: 'confirmed',
                    amount: total_amount,
                    customerName: customer_name,
                  }).catch(e => console.warn('Order notif error:', e.message));

                  connection.release();
                    res.status(201).json({
                      success: true,
                      message: "Order created successfully",
                      data: {
                        order_id: orderId,
                        order_number,
                        razorpay_order_id: razorpayOrder.id,
                        amount: razorpayOrder.amount,
                        currency: razorpayOrder.currency,
                        key_id: (process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_TEST_API_KEY_ID || '').trim(),
                        customer_name: customer_name,
                        customer_email: customer_email
                      }
                    });
                });
              })
              .catch(err => {
                connection.rollback(() => {
                  connection.release();
                  next(err);
                });
              });
          }
        );

      } catch (error) {
        connection.rollback(() => {
          connection.release();
          next(error);
        });
      }
    });
  });
};

exports.web_hook = (req,res,next) => {
  try{
       
    const webhookSignature = req.headers["x-razorpay-signature"]

    const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(req.rawBody)
    .digest("hex"); 

    const isWebhookValid = expectedSignature === webhookSignature

    if(!isWebhookValid){
     return res.status(400).json({msg:"webhook signature is invalid!"})
    }

    const paymentDetails = req.body.payload.payment.entity

    let fetchSql = "select * from orders where razorpay_order_id = ? limit 1"
    db.query(fetchSql,[paymentDetails.order_id],(error,result) => {
      if(error)return next(error);
      if (!result || result.length === 0) {
        return res.status(404).json({ msg: "Order not found" });
      }
      // Idempotency check
      if (result[0].payment_verified == 1) {
        return res.status(200).json({ msg: "Webhook already processed" });
      }
      const FINAL_STATUSES = ["captured", "failed"];
      if (FINAL_STATUSES.includes(result[0].payment_status)) {
        return res.status(200).json({ msg: "Final state already set" });
      }
      if(paymentDetails.status == "captured"){
        let updatesql = "update orders set payment_verified = ?, payment_status = ?, order_status = 'confirmed', payment_id = ?, razorpay_signature = ? where razorpay_order_id = ?";
        db.query(updatesql,[1, paymentDetails.status, paymentDetails.id, webhookSignature, paymentDetails.order_id],(error1,result1) => {
          if(error1)return next(error1);

          // Trigger automated WhatsApp confirmation
          try {
            sendOrderConfirmationWhatsApp(result[0]).catch(e => console.error("Webhook WA confirmation error:", e));
          } catch(e) {
            console.error("Webhook WA trigger error:", e);
          }

          res.status(200).json({msg:"Webhook received successfully!"});
        })
      }
      else if(paymentDetails.status == "failed"){
        let updatesql = "update orders set payment_status = ?, order_status = 'cancelled' where razorpay_order_id = ?";
        db.query(updatesql,[paymentDetails.status, paymentDetails.order_id],(error1,result1) => {
          if(error1)return next(error1);
          res.status(200).json({msg:"Webhook received successfully!"});
        })
      }
    })
    
  }
  catch(error){
    next(error);
  }
}

exports.verify_payment = async (req, res, next) => {
  try {
    const { 
      order_number, 
      razorpay_payment_id, 
      razorpay_order_id, 
      razorpay_signature 
    } = req.body;

    if (!order_number || order_number.trim() === "") {
      return next(createError.BadRequest('Invalid order_id!'));
    }

    // Fetch the order from DB
    const [orderRows] = await db.promise().query(
      `SELECT * FROM orders WHERE order_number = ? LIMIT 1`,
      [order_number]
    );

    if (!orderRows || orderRows.length === 0) {
      return res.status(404).json({ msg: "Order not found" });
    }

    const order = orderRows[0];

    // If already verified and captured
    if (order.payment_verified === 1 && order.payment_status === "captured") {
      try {
        sendOrderConfirmationWhatsApp(order).catch(e => console.error("Verify WA error:", e));
      } catch (e) {
        console.error("WA error:", e);
      }

      return res.status(200).json({
        msg: "payment verified",
        order: {
          order_number: order.order_number,
          order_status: order.order_status,
          shipping_date: order.shipping_date,
          delivery_date: order.delivery_date,
          created_at: order.created_at,
          customer_name: order.customer_name,
          customer_email: order.customer_email,
          customer_phone: order.customer_phone
        }
      });
    }

    // Attempt Client Signature Verification if signature was passed from frontend
    if (razorpay_payment_id && razorpay_order_id && razorpay_signature) {
      const keySecret = (process.env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_TEST_KEY_SECRET || "").trim();
      const generatedSignature = crypto
        .createHmac("sha256", keySecret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");

      if (generatedSignature === razorpay_signature) {
        await db.promise().query(
          `UPDATE orders 
           SET payment_verified = 1, 
               payment_status = 'captured', 
               order_status = 'confirmed',
               payment_id = ?, 
               razorpay_signature = ? 
           WHERE order_number = ?`,
          [razorpay_payment_id, razorpay_signature, order_number]
        );

        order.payment_verified = 1;
        order.payment_status = 'captured';
        order.order_status = 'confirmed';
        order.payment_id = razorpay_payment_id;

        try {
          // Auto-save user's latest shipping details to users table on verified payment
          if (order.customer_email || order.user_id) {
            db.promise().query(
              `UPDATE users 
               SET name = COALESCE(NULLIF(?, ''), name),
                   phone = COALESCE(NULLIF(?, ''), phone),
                   address = COALESCE(NULLIF(?, ''), address),
                   city = COALESCE(NULLIF(?, ''), city),
                   state = COALESCE(NULLIF(?, ''), state),
                   pincode = COALESCE(NULLIF(?, ''), pincode)
               WHERE id = ? OR LOWER(email) = LOWER(?)`,
              [
                order.customer_name || "",
                order.customer_phone || "",
                order.customer_address || "",
                order.city || "",
                order.state || "",
                order.pincode || "",
                order.user_id && !isNaN(order.user_id) ? Number(order.user_id) : -1,
                order.customer_email || ""
              ]
            ).catch(e => console.warn("Save address on verify error:", e.message));
          }

          sendOrderConfirmationWhatsApp(order).catch(e => console.error("Verify WA error:", e));
          sendOrderNotification({
            orderNumber: order.order_number,
            status: 'confirmed',
            amount: order.total_amount,
            customerName: order.customer_name,
          }).catch(e => console.warn("Order notif error:", e.message));
        } catch (e) {
          console.error("WA error:", e);
        }

        return res.status(200).json({
          msg: "payment verified",
          order: {
            order_number: order.order_number,
            order_status: "confirmed",
            payment_status: "captured",
            shipping_date: order.shipping_date,
            delivery_date: order.delivery_date,
            created_at: order.created_at,
            customer_name: order.customer_name,
            customer_email: order.customer_email,
            customer_phone: order.customer_phone
          }
        });
      }
    }

    // Fallback: Inquire Razorpay API directly using razorpay_order_id if available
    if (order.razorpay_order_id && razorpayInstance) {
      try {
        const payments = await razorpayInstance.orders.fetchPayments(order.razorpay_order_id);
        if (payments && payments.items && payments.items.length > 0) {
          const successfulPayment = payments.items.find(p => p.status === 'captured' || p.status === 'authorized');
          if (successfulPayment) {
            await db.promise().query(
              `UPDATE orders 
               SET payment_verified = 1, 
                   payment_status = 'captured', 
                   order_status = 'confirmed',
                   payment_id = ? 
               WHERE order_number = ?`,
              [successfulPayment.id, order_number]
            );

            order.payment_verified = 1;
            order.payment_status = 'captured';
            order.order_status = 'confirmed';
            order.payment_id = successfulPayment.id;

            try {
              sendOrderConfirmationWhatsApp(order).catch(e => console.error("Verify WA error:", e));
            } catch (e) {
              console.error("WA error:", e);
            }

            return res.status(200).json({
              msg: "payment verified",
              order: {
                order_number: order.order_number,
                order_status: "confirmed",
                payment_status: "captured",
                shipping_date: order.shipping_date,
                delivery_date: order.delivery_date,
                created_at: order.created_at,
                customer_name: order.customer_name,
                customer_email: order.customer_email,
                customer_phone: order.customer_phone
              }
            });
          }
        }
      } catch (rpErr) {
        console.error("Direct Razorpay payment check failed:", rpErr.message);
      }
    }

    // If payment could not be verified
    return res.status(200).json({
      msg: "payment not verified"
    });
  } catch (error) {
    next(error);
  }
};

exports.cancel_order = async (req, res, next) => {
  try {
    const { order_number, reason = "Payment was cancelled/closed by user" } = req.body;

    if (!order_number || order_number.trim() === "") {
      return next(createError.BadRequest("Order number is required"));
    }

    // Only update if not already captured/confirmed
    const [result] = await db.promise().query(
      `UPDATE orders 
       SET payment_status = 'failed', order_status = 'cancelled', payment_verified = 0 
       WHERE order_number = ? AND payment_status != 'captured'`,
      [order_number]
    );

    return res.status(200).json({
      success: true,
      message: "Order marked as cancelled/failed",
      affectedRows: result.affectedRows
    });
  } catch (error) {
    next(error);
  }
};

exports.track_order = async (req, res, next) => {
  try {
    const { order_number, email, phone } = req.body;

    if (!order_number || order_number.trim() === "") {
      return next(createError.BadRequest("Order number is required"));
    }

    if ((!email || email.trim() === "") && (!phone || phone.trim() === "")) {
      return next(createError.BadRequest("Email or phone is required"));
    }

    // Build query based on whether email or phone is provided
    let sql = `SELECT id, order_number, customer_name, customer_email, customer_phone,
               order_status, shipping_date, delivery_date, packed_at, created_at,
               total_amount, payment_status, payment_verified
               FROM orders WHERE order_number = ?`;
    const params = [order_number];

    if (email && email.trim() !== "") {
      sql += " AND customer_email = ?";
      params.push(email.trim());
    } else if (phone && phone.trim() !== "") {
      sql += " AND customer_phone = ?";
      params.push(phone.trim());
    }

    sql += " LIMIT 1";

    const [orderRows] = await db.promise().query(sql, params);

    if (!orderRows || orderRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No order found. Please check your Order ID and Email/Phone."
      });
    }

    const order = orderRows[0];

    // Fetch order items
    const [items] = await db.promise().query(
      `SELECT oi.product_name, oi.product_price, oi.quantity, oi.size, oi.color
       FROM order_items oi WHERE oi.order_id = ?`,
      [order.id]
    );

    res.status(200).json({
      success: true,
      order: {
        order_number: order.order_number,
        customer_name: order.customer_name,
        order_status: order.order_status,
        shipping_date: order.shipping_date,
        delivery_date: order.delivery_date,
        packed_at: order.packed_at,
        created_at: order.created_at,
        total_amount: order.total_amount,
        payment_status: order.payment_status,
        payment_verified: order.payment_verified,
        items
      }
    });

  } catch (error) {
    console.error("Track order error:", error);
    next(error);
  }
};

/**
 * Fetch all orders for a logged-in customer by user_id or email
 * POST /user/my_orders (Protected by userAuth)
 */
exports.fetch_my_orders = async (req, res, next) => {
  try {
    const userId = req.userId || req.user?.id;
    const userEmail = req.userEmail || req.user?.email;

    if (!userId && !userEmail) {
      return next(createError.Unauthorized("Authentication required to view order history"));
    }

    let sql = `
      SELECT o.id, o.order_number, o.customer_name, o.customer_email, o.customer_phone,
             o.order_status, o.shipping_date, o.delivery_date, o.packed_at, o.created_at,
             o.total_amount, o.payment_status, o.payment_verified,
             (
               SELECT JSON_ARRAYAGG(
                 JSON_OBJECT(
                   'product_name', oi.product_name,
                   'product_price', oi.product_price,
                   'quantity', oi.quantity,
                   'size', oi.size,
                   'color', oi.color
                 )
               )
               FROM order_items oi
               WHERE oi.order_id = o.id
             ) AS items
      FROM orders o
      WHERE NOT (o.order_status = 'pending' AND (o.payment_status = 'created' OR o.payment_status = 'pending' OR o.payment_status IS NULL))
        AND (o.user_id = ? OR o.customer_email = ?)
      ORDER BY o.created_at DESC LIMIT 50
    `;

    const [rows] = await db.promise().query(sql, [userId || 0, userEmail || ""]);

    return res.status(200).json({
      success: true,
      orders: rows || []
    });
  } catch (error) {
    console.error("Fetch my orders error:", error);
    next(error);
  }
};