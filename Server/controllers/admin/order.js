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
                o.customer_address,
                o.city,
                o.state,
                o.pincode,
                o.created_at,
                o.subtotal,
                o.discount_amount,
                o.shipping,
                o.gst_amount,
                o.total_amount,
                o.payment_id,
                o.payment_status,
                o.payment_verified,
                o.order_status AS status,
                o.shipping_date,
                o.delivery_date,
                o.tracking_number,
                o.courier_partner,
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
       let sql = `
         SELECT 
           oi.*,
           COALESCE(
             (SELECT pi.image_path FROM product_images pi WHERE pi.product_id = oi.product_id AND pi.is_primary = 1 LIMIT 1),
             (SELECT pi.image_path FROM product_images pi WHERE pi.product_id = oi.product_id LIMIT 1)
           ) AS image_path,
           p.sku AS product_sku
         FROM order_items oi
         LEFT JOIN products p ON p.id = oi.product_id
         WHERE oi.order_id = ?
       `;
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
        const { status, shipping_date, delivery_date, tracking_number, courier_partner } = req.body;

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

        // Update tracking_number if provided
        if (tracking_number !== undefined) {
            sql += ", tracking_number = ?";
            params.push(tracking_number || null);
        }

        // Update courier_partner if provided
        if (courier_partner !== undefined) {
            sql += ", courier_partner = ?";
            params.push(courier_partner || null);
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

// New: Get label-ready data for one or more orders (for shipping sticker generation)
exports.getOrderLabelData = async (req, res, next) => {
    try {
        const { orderIds } = req.body;

        if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
            return next(createError.BadRequest('orderIds array is required'));
        }

        // Sanitize IDs
        const safeIds = orderIds.map(id => parseInt(id, 10)).filter(id => !isNaN(id));
        if (safeIds.length === 0) {
            return next(createError.BadRequest('No valid order IDs provided'));
        }

        const placeholders = safeIds.map(() => '?').join(',');

        // Fetch orders
        const [orders] = await db.promise().query(
            `SELECT 
                o.id,
                o.order_number,
                o.customer_name,
                o.customer_email,
                o.customer_phone,
                o.customer_address,
                o.city,
                o.state,
                o.pincode,
                o.created_at,
                o.total_amount,
                o.payment_id,
                o.payment_status,
                o.order_status AS status,
                o.shipping_date,
                o.delivery_date,
                o.tracking_number,
                o.courier_partner
             FROM orders o
             WHERE o.id IN (${placeholders})
             ORDER BY o.created_at DESC`,
            safeIds
        );

        // Fetch items for all orders in one query
        const [items] = await db.promise().query(
            `SELECT 
                oi.*,
                p.sku AS product_sku,
                COALESCE(
                  (SELECT pi.image_path FROM product_images pi WHERE pi.product_id = oi.product_id AND pi.is_primary = 1 LIMIT 1),
                  (SELECT pi.image_path FROM product_images pi WHERE pi.product_id = oi.product_id LIMIT 1)
                ) AS image_path
             FROM order_items oi
             LEFT JOIN products p ON p.id = oi.product_id
             WHERE oi.order_id IN (${placeholders})`,
            safeIds
        );

        // Group items by order_id
        const itemsByOrder = {};
        items.forEach(item => {
            if (!itemsByOrder[item.order_id]) {
                itemsByOrder[item.order_id] = [];
            }
            itemsByOrder[item.order_id].push(item);
        });

        // Assemble label data
        const labelData = orders.map(order => ({
            ...order,
            items: itemsByOrder[order.id] || []
        }));

        res.status(200).json({ success: true, labels: labelData });

    } catch (error) {
        console.error("Label data error:", error);
        next(error);
    }
};

// New: Bulk status update
exports.bulkUpdateStatus = async (req, res, next) => {
    try {
        const { orderIds, status } = req.body;

        if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
            return next(createError.BadRequest('orderIds array is required'));
        }

        if (!status) {
            return next(createError.BadRequest('status is required'));
        }

        const validStatuses = ['pending', 'confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status.toLowerCase())) {
            return next(createError.BadRequest('Invalid status value'));
        }

        const safeIds = orderIds.map(id => parseInt(id, 10)).filter(id => !isNaN(id));
        if (safeIds.length === 0) {
            return next(createError.BadRequest('No valid order IDs provided'));
        }

        const placeholders = safeIds.map(() => '?').join(',');

        let sql = `UPDATE orders SET order_status = ?`;
        const params = [status];

        if (status.toLowerCase() === 'packed') {
            sql += ", packed_at = NOW()";
        }

        sql += ` WHERE id IN (${placeholders})`;
        params.push(...safeIds);

        const [result] = await db.promise().query(sql, params);

        res.status(200).json({
            success: true,
            message: `${result.affectedRows} order(s) updated to ${status}`,
            affectedRows: result.affectedRows
        });

    } catch (error) {
        console.error("Bulk status update error:", error);
        next(error);
    }
};
