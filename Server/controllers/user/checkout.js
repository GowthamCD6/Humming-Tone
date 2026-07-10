const db = require("../../config/db.js");
const createError = require("http-errors");
const crypto = require("crypto");
const razorpayInstance = require("../../utils/rajorpay.js");

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
          items
        } = req.body;

        if (!customer_name || !customer_email || !customer_phone) {
          throw createError.BadRequest("Customer details are required");
        }

        if (!Array.isArray(items) || items.length === 0) {
          throw createError.BadRequest("Order items are required");
        }

        const allowedSizes = ['XS','S','M','L','XL','XXL','XXXL','4XL','5XL'];
        let subtotal = 0;

        for (const item of items) {
          const { product_id, quantity, size } = item;

          if (!product_id || !quantity || quantity <= 0 || !size) {
            throw createError.BadRequest("Invalid cart item");
          }

          if (!allowedSizes.includes(size)) {
            throw createError.BadRequest("Invalid size selected");
          }

          const [rows] = await connection.promise().query(
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
            [product_id, size]
          );

          if (rows.length === 0) {
            throw createError.BadRequest("Product variant not found");
          }

          const { price, variant_id, product_name } = rows[0];

          subtotal += price * quantity;

          // attach verified data
          item._verified_price = price;
          item._variant_id = variant_id;
          item._product_name = product_name;
        }

        const safeDiscount = Math.min(discount_amount, subtotal);
        const total_amount = subtotal - safeDiscount + shipping;

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
            razorpay_order_id,
            order_status
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
          `,
          [
            order_number,
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
                      customer_name:customer_name,
                      customer_email:customer_email
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
        let updatesql = "update orders set payment_verified = ?, payment_status = ?, razorpay_signature = ? where razorpay_order_id = ?";
        db.query(updatesql,[1, paymentDetails.status, webhookSignature, paymentDetails.order_id],(error1,result1) => {
          if(error1)return next(error1);
          res.status(200).json({msg:"Webhook received successfully!"});
        })
      }
      else if(paymentDetails.status == "failed"){
        let updatesql = "update orders set payment_status = ? where razorpay_order_id = ?";
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

exports.verify_payment = (req,res,next) => {
  try{
    const{order_number} = req.body;
    if(!order_number || order_number.trim() == ""){
      return next(createError.BadRequest('Invalid order_id!'));
    }
    let fetchSql = `SELECT payment_verified, payment_status, order_status, 
                     shipping_date, delivery_date, created_at, 
                     customer_name, customer_email, customer_phone
                     FROM orders WHERE order_number = ?`;
    db.query(fetchSql,[order_number],(error,result) => {
      if(error)return next(error);
      if(!result || result.length === 0){
        return res.status(404).json({ msg: "Order not found" });
      }
      if(result[0].payment_verified && result[0].payment_status == "captured"){
        return res.status(200).json({
          "msg":"payment verified",
          order: {
            order_number,
            order_status: result[0].order_status,
            shipping_date: result[0].shipping_date,
            delivery_date: result[0].delivery_date,
            created_at: result[0].created_at,
            customer_name: result[0].customer_name,
            customer_email: result[0].customer_email,
            customer_phone: result[0].customer_phone
          }
        })
      }
      else if(!result[0].payment_verified || result[0].payment_status == "failed"){
        return res.status(200).json({
          "msg":"payment not verified"
        })
      }
    })
  }
  catch(error){
    next(error);
  }
}

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
}