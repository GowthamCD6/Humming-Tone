const db = require("../../config/db");
const createError = require("http-errors");
const { sendOrderStatusUpdateWhatsApp } = require("../../utils/whatsapp");

exports.getManageOrders = async (req, res) => {
    try {
        const query = `
            SELECT 
                o.id,
                o.order_number,
                o.customer_name,
                o.customer_email,
                o.customer_phone,
                o.created_at,
                o.subtotal,
                o.discount_amount,
                o.shipping,
                o.gst_amount,
                o.total_amount,
                o.payment_id,
                o.order_status AS status,
                o.shipping_date,
                o.delivery_date,
                COUNT(oi.id) AS unique_items_count,
                IFNULL(SUM(oi.quantity), 0) AS total_qty
            FROM orders o
            LEFT JOIN order_items oi ON o.id = oi.order_id
            GROUP BY o.id
            ORDER BY o.created_at DESC;
        `;

        // Use the promise wrapper on the mysql2 pool
        const [rows] = await db.promise().query(query);

        res.status(200).json(rows || []);

    } catch (error) {
        console.error("SQL ERROR:", error.message);
        res.status(500).json({ 
            success: false, 
            message: "Database query failed", 
            error: error.message 
        });
    }
};

exports.getOrderItems = (req,res,next) => {
    try{
       const{order_id} = req.params;
       if(!order_id || order_id.trim() == ""){
        return next(createError.BadRequest('Invalid order id!'));
       }
       let sql = "select * from order_items where order_id = ?";
       db.query(sql,[order_id],(error,result) => {
        if(error)return next(error);
        res.send(result);
       })
    }
    catch(error){
        next(error);
    }
}

exports.updateOrderStatus = async (req, res, next) => {
    try {
        const { orderId } = req.params;
        const { status, shipping_date, delivery_date } = req.body;

        if (!orderId || !status) {
            return next(createError.BadRequest('Order ID and status are required'));
        }

        // Validate status
        const validStatuses = ['pending', 'confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status.toLowerCase())) {
            return next(createError.BadRequest('Invalid status value'));
        }

        // Build dynamic update
        let sql = "UPDATE orders SET order_status = ?";
        const params = [status];

        // Auto-set packed_at when status moves to packed
        if (status.toLowerCase() === 'packed') {
            sql += ", packed_at = NOW()";
        }

        // Update shipping_date if provided
        if (shipping_date !== undefined) {
            sql += ", shipping_date = ?";
            params.push(shipping_date || null);
        }

        // Update delivery_date if provided
        if (delivery_date !== undefined) {
            sql += ", delivery_date = ?";
            params.push(delivery_date || null);
        }

        sql += " WHERE id = ?";
        params.push(orderId);

        const [result] = await db.promise().query(sql, params);

        if (result.affectedRows === 0) {
            return next(createError.NotFound('Order not found'));
        }

        // Fetch updated order record to send WhatsApp delivery/status update
        let whatsappResult = null;
        try {
            const [orderRows] = await db.promise().query(
                "SELECT * FROM orders WHERE id = ? LIMIT 1",
                [orderId]
            );
            if (orderRows.length > 0 && orderRows[0].customer_phone) {
                whatsappResult = await sendOrderStatusUpdateWhatsApp(orderRows[0], {
                    status,
                    shipping_date: shipping_date !== undefined ? shipping_date : orderRows[0].shipping_date,
                    delivery_date: delivery_date !== undefined ? delivery_date : orderRows[0].delivery_date
                });
            }
        } catch (waErr) {
            console.error("WhatsApp status notification error:", waErr.message);
        }

        res.status(200).json({ 
            success: true, 
            message: 'Order status updated successfully',
            status: status,
            whatsapp: whatsappResult
        });

    } catch (error) {
        console.error("Update status error:", error);
        next(error);
    }
}

