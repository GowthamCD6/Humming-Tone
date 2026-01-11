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
            order_status,
            status
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'pending')
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
    const body = JSON.stringify(req.body);
       
    const webhookSignature = req.headers["x-razorpay-signature"]

    const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(body)
    .digest("hex"); 

    const isWebhookValid = expectedSignature === webhookSignature

    if(!isWebhookValid){
     return res.status(400).json({msg:"webhook signature is invalid!"})
    }

       // update the payment status in DB

      //  const paymentDetails = req.body.payload.payment.entity; // req.body()
      //  const payment = await paymentModel.findOne({orderId: paymentDetails.order_id})       
      //  payment.status = paymentDetails.status;
      //  await payment.save();
  }
  catch(error){
    next(error);
  }
}