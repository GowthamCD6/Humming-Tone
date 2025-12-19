const db = require("../../config/db");
const createError = require("http-errors");

// add product -> first call it, then call add_variant
exports.add_product  = (req,res,next) => {
    try{
      const files = req.files;
      if (!files || files.length === 0) {
        return res.status(400).json({ message: "At least one image is required" });
      }

      // first image = primary
      const primary_image = files[0].path;

      // all images
      const image_paths = files.map(file => file.path);

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

      const featured = is_featured ? 1 : 0;
      const active = is_active ? 1 : 0;

      const allowedGenders = ["men","women","kids","baby"];
      if (!allowedGenders.includes(gender)) {
        return res.status(400).json({ message: "Invalid gender value" });
      }

      for(const[key,value] of Object.entries(stringFields)){
        if(typeof value !== "string" || value.trim() === ""){
            return res.status(400).json({ message: `${key} must be a non-empty string` });
        }
      }
      
      for(const[key,value] of Object.entries(numberFields)){
        if(value == null || value === undefined || isNaN(value) || value < 0){
            return res.status(400).json({ message: `${key} must be a valid number` });
        }
      }

      for(const[key,value] of Object.entries(booleanFields)){
        if(typeof value !== "boolean"){
            return res.status(400).json({ message: `${key} must be boolean (true/false)` });
        }
      }

      let insertSql = `insert into products(name, about, sku, category_id, subcategory, brand,
                       color, material, care_instructions, gender, age_range, weight, dimensions, stock_quantity, 
                       is_featured, is_active, image_path) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;

      db.query(insertSql,[name, about, sku, category_id, subcategory, brand, color, material, care_instructions, gender, age_range, weight, dimensions, stock_quantity, featured, active, primary_image], (err1,res1) => {
        if(err1){
            if (err1.code === "ER_DUP_ENTRY") {
                return next(createError.Conflict("SKU already exists"));
            }
            return next(err1);
        }
        else if(res1.affectedRows === 0)return next(createError.BadGateway('Insert failed'));

        // insert other image path's
        let imagesSql = "insert into product_images(product_id, image_path, is_primary) values(?,?,?)";
        const product_id = res1.insertId;
        // inserting each image
        let completed = 0;
        for (const path of image_paths) {
        db.query(imagesSql,[product_id, path, completed === 0 ? 1 : 0],(err2) => {
            if (err2) return next(err2);
            completed++;
            if (completed === image_paths.length) {
                return res.send("Product added successfully!");
            }
        }
        );
        }
      })
      
    }
    catch(error){
        next(error);
    }
}

exports.add_variant = (req,res,next) => {
    try{
      const{product_id,size,price,original_price,stock_quantity} = req.body;
      if(typeof size !== "string" || size.trim() === ""){
        return res.status(400).json({ message: `size must be a non-empty string` });
      }
      const numberFields = {product_id,price,original_price,stock_quantity};
      for(const[key,value] of Object.entries(numberFields)){
        if(value == null || value === undefined || isNaN(value) || value < 0){
            return res.status(400).json({ message: `${key} must be a valid number` });
        }
      }
      let insertSql = "insert into product_variants(product_id, size, price, original_price, stock_quantity) values (?,?,?,?,?)";
      db.query(insertSql,[product_id, size, price, original_price, stock_quantity],(err1,res1) => {
        if(err1)return next(err1);
        if(res1.affectedRows === 0){
            return next(createError.BadGateway('Insert failed'));
        }
        res.send('product variant added successfully!');
      })
    }
    catch(error){
      next(error);
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