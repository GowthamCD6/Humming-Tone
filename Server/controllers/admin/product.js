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

      const{name, about, sku, category, subcategory, brand, color, material, care_instructions, gender, age_range, weight, dimensions, is_featured, is_active} = req.body;
      
      const stringFields = {
        name, about, sku, category, subcategory, brand, color, // category must be slug, not name
        material, care_instructions, gender, age_range, dimensions
      };

      const numberFields = {
        weight
      };

      const booleanFields = {
       is_featured, is_active
      };

      const featured = is_featured ? 1 : 0;
      const active = is_active ? 1 : 0;

      const allowedGenders = ["men","women","kids","baby"];
      if (!gender || !allowedGenders.includes(gender)) {
        return res.status(400).json({ message: "Invalid gender value" });
      }

      for(const[key,value] of Object.entries(stringFields)){
        if(value !== undefined && (typeof value !== "string" || value.trim() === "")){
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

      let categoryIdSql = "select id from categories where slug = ? limit 1";
      let category_id;
      db.query(categoryIdSql,[category],(err0,res0) => {
        if(err0)return next(err0);
        if(res0.length === 0){
            return next(createError.NotFound('slug not found'));
        }
        category_id = res0[0].id;
        let insertSql = `insert into products(name, about, sku, category_id, subcategory, brand,
                         color, material, care_instructions, gender, age_range, weight, dimensions,
                         is_featured, is_active, image_path) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
  
        db.query(insertSql,[name, about, sku, category_id, subcategory, brand, color, material, care_instructions, gender, age_range, weight, dimensions, featured, active, primary_image], (err1,res1) => {
          if(err1){
              if (err1.code === "ER_DUP_ENTRY") {
                  return next(createError.Conflict("SKU already exists"));
              }
              return next(err1);
          }
          else if(res1.affectedRows === 0)return next(createError.InternalServerError('Insert failed'));
  
          // insert other image path's
          let imagesSql = "insert into product_images(product_id, image_path, is_primary) values(?,?,?)";
          const product_id = res1.insertId;
          // inserting each image
          let completed = 0;
          image_paths.forEach((path, index) => {
          db.query(imagesSql,[product_id, path, index === 0 ? 1 : 0],(err2) => {
            if (err2) return next(err2);  
            completed++;  
            if (completed === image_paths.length) {
                res.status(201).json({ message: "Product added successfully!" });
            }
            }
          );
          });

        })

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
        if(value == null || value === undefined || isNaN(value) || value <= 0){
            return res.status(400).json({ message: `${key} must be a valid number` });
        }
      }
      if (original_price < price) {
        return res.status(400).json({
            message: "original_price must be greater than or equal to price"
        });
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

// to show on manage products page
exports.fetch_products = (req,res,next) => {
  try{
    let getSql = "select * from products";
    db.query(getSql,(err1,res1) => {
      if(err1)return next(err1);
      if(res1.length == 0)return next(createError.NotFound('Products not found!'));
      res.send(res1);
    })
  }
  catch(error){
    next(error);
  }
}

// to fetch the product variants - edit, delete
exports.fetch_variants = (req,res,next) => {
  try{
    const{id} = req.params;
    if(!id || id.trim() === null){
      return next(createError.BadRequest('id is required!'));
    }
    let fetchSql = "select * from products p left join product_variants v on p.id = v.product_id";
    db.query(fetchSql,(err,res) => {
      if(err)return next(err);
      if(res.length == 0)return next(createError.NotFound('Variants'));
      res.send(res);
    })
  }
  catch(error){
    next(error);
  }
}

exports.update_product = (req,res,next) => {
  try{
    const{id} = req.params;
    // const{}
  }
  catch(error){
    next(error);
  }
}

exports.delete_product = (req,res,next) => {
  try{
    const{id} = req.params;
    const{variants, deleteAll} = req.body;
    if(!id || id.trim() === "" || isNaN(id)){
      return next(createError.BadRequest('Invalid product information!'));
    }
    else if(typeof deleteAll !== "boolean"){
      return next(createError.BadRequest('Invalid input type!'));
    }
    else if(deleteAll){
      let deleteAllSql = "delete from products where id = ?";
      db.query(deleteAllSql,[id],(err,res0) => {
        if(err)return next(err);
        if(res0.affectedRows === 0)return next(createError.NotFound('deletion failed, product not found'));
        res.send('Product deleted successfully!');
      })
    }
    else if(!Array.isArray(variants) || variants.length == 0){
      return next(createError.BadRequest('Inalid Request!'));
    }
    else{
        let deleteSql = "delete from product_variants where size in (?) and product_id = ?";
        db.query(deleteSql,[variants,id],(err1,res1) => {
          if(err1)return next(err1);
          if(res1.affectedRows === 0)return next(createError.NotFound('deletion failed, variant not found!'));
          return res.send('Selected variants deleted successfully!');
        })
    }
  }
  catch(error){
    next(error);
  }
}