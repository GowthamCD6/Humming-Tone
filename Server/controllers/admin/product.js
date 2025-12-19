const db = require("../../config/db");
const createError = require("http-errors");

// add product -> first call it, then call add_variant
exports.add_product  = (req,res,next) => {
    try{
      const{name, about, sku, category_id, subcategory, brand, color, material, care_instructions, gender, age_range, weight, dimensions, stock_quantity, is_featured, is_active} = req.body;

      const stringFields = {
        name, about, sku, subcategory, brand, color,
        material, care_instructions, gender, age_range, dimensions
      };

      const numberFields = {
        category_id, weight, stock_quantity
      };

      const booleanFields = {
       is_featured, is_active
      };

      for(const[key,value] of Object.entries(stringFields)){
        if(typeof(value) !== "string" || value.trim() != ""){
            return res.status(400).json({ message: `${key} must be a non-empty string` });
        }
      }
      
      for(const[key,value] of Object.entries(numberFields)){
        if(val == null || value === undefined || isNaN(value) || value < 0){
            return res.status(400).json({ message: `${key} must be a valid number` });
        }
      }

      for(const[key,value] of Object.entries(booleanFields)){
        if(typeof(value) !== "boolean"){
            return res.status(400).json({ message: `${key} must be boolean (true/false)` });
        }
      }

      let insertSql = `insert into products(name, about sku, category_id, subcategory, brand,
                       color, material, care_instructions, gender, age_range, weight, dimensions, stock_quantity, 
                       is_feautured, is_active, image_path) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;

      db.query(insertSql,[name, about, sku, category_id, subcategory, brand, color, material, care_instructions, gender, age_range, weight, dimensions, stock_quantity, is_featured, is_active, image_path], (err1,res1) => {
        if(err1)return next(error);
        if(res1.affectedRows === 0)return next(createError.BadGateway('Insert failed'));
        res1.send('Product added successfully!');
      })
      
    }
    catch(error){
        next(error);
    }
}

exports.add_variant = (req,res,next) => {
    try{
      const{product_id,size,price,original_price,stock_quantity} = req.body;
      if(!size.trim() == "" || typeof(size) !== "string"){
        return res.status(400).json({ message: `size must be a non-empty string` });
      }
      const numberFields = {product_id,price,original_price,stock_quantity};
      for(const[key,val] of Object.entries(numberFields)){
        if(val == null || val === undefined || isNaN(val)){
            return res.status(400).json({ message: `${key} must be a valid number` });
        }
      }
      let insertSql = "insert into product_variants(prouduct_id, size, price, original_price, stock_quantity) values (?,?,?,?,?)";
      db.query(insertSql,[product_id, size, price, original_price, stock_quantity],(err1,res1) => {
        if(err1)return next(err1);
        if(res1.affectedRows === 0){
            return next(createError.BadGateway('Insert failed'));
        }
        res.send('product variant added successfully!');
      })
    }
    catch(error){

    }
}

//   name VARCHAR(255) NOT NULL,
//   about TEXT,
//   original_price DECIMAL(10,2),
//   sku VARCHAR(100) NOT NULL UNIQUE, -- stock keeping unit
//   category_id INT,
//   subcategory VARCHAR(100),
//   brand VARCHAR(100),
//   color VARCHAR(50),
//   material VARCHAR(100),
//   care_instructions TEXT,
//   gender ENUM('men','women','kids','baby'),
//   age_range VARCHAR(50),
//   weight DECIMAL(8,2),
//   dimensions VARCHAR(100),
//   stock_quantity INT DEFAULT 0,
//   is_featured TINYINT(1) DEFAULT 0,
//   is_active TINYINT(1) DEFAULT 1,