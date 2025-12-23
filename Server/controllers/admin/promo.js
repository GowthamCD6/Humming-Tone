const createError = require("http-errors");
const db = require("db");

exports.add_promo_code = (req,res,next) => {
    try{
       let{code,discount_type,discount_value,min_order_amount,max_discount,usage_limit,start_date,end_date,is_active} = req.body;
       if(code === undefined || !code || typeof code !== "string" || code.length < 3){
        return next(createError.BadRequest('Invalid Code!'));
       }
       if(discount_type === undefined || discount_type.trim() == "" || (discount_type != "percentage" && discount_type != "fixed")){
         return next(createError.BadRequest('Invalid discount type'));
       }
       discount_value = Number(discount_value);
       if(isNaN(discount_value) || discount_value <= 0){
        return next(createError.BadRequest('Invalid discount value'));
       }
       min_order_amount = Number(min_order_amount);
       if(isNaN(min_order_amount) || min_order_amount < 0){
        return next(createError.BadRequest('Invalid minimum order amount'));
       }
       
       if (max_discount !== undefined) {
         max_discount = Number(max_discount);
         if (isNaN(max_discount) || max_discount <= 0) {
           return res.status(400).json({ message: "Invalid max discount" });
         }
       }
   
       if (discount_type === "percentage" && max_discount === 0) {
         return res.status(400).json({ message: "Max discount required for percentage type" });
       }
   
       usage_limit = Number(usage_limit);
       if (!Number.isInteger(usage_limit) || usage_limit <= 0) {
         return res.status(400).json({ message: "Invalid usage limit" });
       }
   
       start_date = new Date(start_date);
       end_date = new Date(end_date);
   
       if (isNaN(start_date.getTime()) || isNaN(end_date.getTime())) {
         return res.status(400).json({ message: "Invalid date format" });
       }
   
       if (end_date <= start_date) {
         return res.status(400).json({ message: "End date must be after start date" });
       }
   
       is_active = is_active ? 1 : 0;
   
       let used_count = 0;

       // check if the promocode already exists in db
       let checkSql = "select * from promo_codes where code = ?";
       db.query(checkSql,[code],(error,result) => {
        if(error)return next(error);
        if(result.length > 0)return next(createError('The promo code already exists'));
        // insert it into promocode
        let insertSql = "insert into promo_codes (code,discount_type,discount_value,min_order_amount,max_discount,usage_limit,start_date,end_date,is_active) values (?,?,?,?,?,?,?,?,?)";
        db.query(insertSql,[code,discount_type,discount_value,min_order_amount,max_discount,usage_limit,start_date,end_date,is_active],(error1,result1) => {
         if(error1 || result1.affectedRows === 0){
             return next(error1 || createError.InternalServerError());
         }
         res.send('promo code inserted successfully');
        })
       })
       
    }
    catch(error){
        next(error);
    }
}

exports.remove_promo_code = (req,res,next) => {
    try{
     
    }
    catch(error){
        next(error);
    }
}


//   id INT AUTO_INCREMENT PRIMARY KEY,
//   code VARCHAR(50) NOT NULL UNIQUE,
//   discount_type ENUM('percentage','fixed') DEFAULT 'percentage',
//   discount_value DECIMAL(10,2) NOT NULL,
//   min_order_amount DECIMAL(10,2) DEFAULT 0.00,
//   max_discount DECIMAL(10,2),
//   usage_limit INT,
//   used_count INT DEFAULT 0,
//   start_date DATETIME,
//   end_date DATETIME,
//   is_active TINYINT(1) DEFAULT 1,
//   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
