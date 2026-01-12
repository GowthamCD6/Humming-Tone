const db = require("../../config/db");
const createError = require("http-errors");

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
                o.total_amount,
                o.payment_id,
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
       const{order_id} = req.body;
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