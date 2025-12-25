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

      const allowedGenders = ['men','children','babies','sports'];
      if (!gender || !allowedGenders.includes(gender)) {
        return res.status(400).json({ message: `Invalid gender value - ${gender}` });
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

      for (const [key, value] of Object.entries(booleanFields)) {
        const num = Number(value);
        if (![0, 1].includes(num)) {
          return res.status(400).json({ message: `${key} must be boolean (true/false)` });
        }
      }

      db.getConnection((connectionError,connection) => {
        if(connectionError)return next(connectionError);
        connection.beginTransaction(TransactionError => {
          if(TransactionError)return next(TransactionError);
          let categoryIdSql = "select id from categories where slug = ? limit 1";
          let category_id;
          db.query(categoryIdSql,[category],(err0,res0) => {
            if(err0 || res0.length === 0){
                return connection.rollback(() => next(err0 || createError.NotFound('slug not found'))); 
            }
            category_id = res0[0].id;
            let insertSql = `insert into products(name, about, sku, category_id, subcategory, brand,
                             color, material, care_instructions, gender, age_range, weight, dimensions,
                             is_featured, is_active, image_path) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
      
            db.query(insertSql,[name, about, sku, category_id, subcategory, brand, color, material, care_instructions, gender, age_range, weight, dimensions, featured, active, primary_image], (err1,res1) => {
              if(err1){
                  if (err1.code === "ER_DUP_ENTRY") {
                      return connection.rollback(() => next(createError.Conflict("SKU already exists"))); 
                  }
                  return connection.rollback(() => next(err1));
              }
              else if(res1.affectedRows === 0)return connection.rollback(() => next(createError.InternalServerError('Insert failed'))); 
      
              // insert other image path's
              let imagesSql = "insert into product_images(product_id, image_path, is_primary) values(?,?,?)";
              const product_id = res1.insertId;
              // inserting each image
              let completed = 0;
              image_paths.forEach((path, index) => {
              db.query(imagesSql,[product_id, path, index === 0 ? 1 : 0],(err2) => {
                if (err2) return connection.rollback(() => next(err2));  
                completed++;  
                if (completed === image_paths.length) { // insert variants
                let { variants } = req.body;
  
                try {
                  variants = JSON.parse(variants);
                } catch {
                  return connection.rollback(() =>
                    res.status(400).json({ message: "Invalid variants format" })
                  );
                }
  
  
                if (!variants || !Array.isArray(variants) || variants.length < 1) {
                  return connection.rollback(() =>
                    res.status(400).json({ message: "Give at least 1 variant" })
                  );
                }
  
                for (const variant of variants) {
                  let { size, price, original_price, stock_quantity } = variant;
  
                  // size validation
                  if (typeof size !== "string" || size.trim() === "") {
                    return connection.rollback(() =>
                      res.status(400).json({ message: "size must be a non-empty string" })
                    );
                  }
  
                  price = Number(variant.price);
                  original_price = Number(variant.original_price);
                  stock_quantity = Number(variant.stock_quantity);
  
                  // number validation
                  const numberFields = { price, original_price, stock_quantity };
                  for (const [key, value] of Object.entries(numberFields)) {
                    if (value == null || isNaN(value) || value <= 0) {
                      return connection.rollback(() =>
                        res.status(400).json({ message: `${key} must be a valid number` })
                      );
                    }
                  }
  
                  // price rule
                  if (original_price < price) {
                    return connection.rollback(() =>
                      res.status(400).json({
                        message: "original_price must be greater than or equal to price"
                      })
                    );
                  }
                }
  
                const insertSql =
                  "INSERT INTO product_variants(product_id, size, price, original_price, stock_quantity) VALUES ?";
  
                const values = variants.map(v => [
                  product_id,
                  v.size.trim(),
                  Number(v.price),
                  Number(v.original_price),
                  Number(v.stock_quantity)
                ]);
  
                db.query(insertSql, [values], (err, result) => {
                  if (err || result.affectedRows !== variants.length) {
                    return connection.rollback(() =>
                      next(createError.BadGateway("Variant insert failed"))
                    );
                  }
  
                  connection.commit(commitErr => {
                    if (commitErr) return next(commitErr);
                    res.status(201).json({ message: "Product & variants added successfully!" });
                  });
                });
  
                }
                }
              );
              });
    
            })
    
          })
  
        })
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
    if (!/^\d+$/.test(id)) {
      return next(createError.BadRequest("Invalid id"));
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
    const{name, about, subcategory, brand, color, material, care_instructions, gender, age_range, weight, dimensions, is_featured, is_active} = req.body;

    if (!/^\d+$/.test(id)) {
      return next(createError.BadRequest("Invalid id"));
    }

    const stringFields = {
      name, about, subcategory, brand, color, 
      material, care_instructions, age_range, dimensions
    };

    const numberFields = {
      weight
    };

    const booleanFields = {
      is_featured, is_active
    };

    const featured = is_featured ? 1 : 0;
    const active = is_active ? 1 : 0;

    for(const[key,value] of Object.entries(stringFields)){
      if(typeof value != "string" || !value || value.trim() === ""){
        return next(createError.BadRequest('Invalid String input!'));
      }
    }

    for(const[key,value] of Object.entries(numberFields)){
      if(value === null || value === undefined || isNaN(value)){
        return next(createError.BadRequest(`${key} - Invalid number input!`));
      }
    }

    for(const[key,value] of Object.entries(booleanFields)){
      if (![0, 1].includes(value)){
        return next(createError.BadRequest(`${key} - Invalid boolean input!`));
      }
    }

    const allowedGenders = ['men','children','babies','sports'];

    if(!allowedGenders.includes(gender)){
      return next(createError.BadRequest('Invalid Gender'));
    }

    let updateSql = "update products set name = ?, about = ?, subcategory = ?, brand = ?, color = ?, material = ?, care_instructions = ?, gender = ?, age_range = ?, weight = ?, dimensions = ?, is_featured = ?, is_active = ? where id = ?";
    db.query(updateSql,[name, about, subcategory, brand, color, material, care_instructions, gender, age_range, weight, dimensions, featured, active, id],(error, result) => {
      if(error || result.affectedRows === 0){
        return next(error || createError.InternalServerError('update failed'))
      }
      res.send('Fields updated successfully!');
    })
  }
  catch(error){
    next(error);
  }
}

exports.update_variant = (req,res,next) => {
  try{
    const{variant_id} = req.params;

    if (!/^\d+$/.test(variant_id)) {
      return next(createError.BadRequest("Invalid id"));
    }

    const{price, original_price, stock_quantity} = req.body;
    const inputFields = {price, original_price, stock_quantity};

    for(const[key,value] of Object.entries(inputFields)){
      if(value === null || value === undefined || isNaN(value)){
        return next(createError.BadRequest('Invalid input field'));
      }
    }
    let updateSql = "update product_variants set price = ?, original_price = ?, stock_quantity = ? where id = ?";
    db.query(updateSql,[price,original_price,stock_quantity,variant_id],(error,result) => {
      if(error || result.affectedRows === 0){
        return next(error || createError.InternalServerError('update failed!'));
      }
      res.send('product variants updated successfully!');
    })
  }
  catch(error){
    next(error);
  }
}

exports.delete_product = (req,res,next) => {
  try{
    const{id} = req.params;
    const{variants, deleteAll} = req.body;

    if (!/^\d+$/.test(id)) {
      return next(createError.BadRequest("Invalid id"));
    }
    else if(typeof deleteAll !== "boolean"){
      return next(createError.BadRequest('Invalid input type!'));
    }
    else if(deleteAll){
      db.getConnection((connectionError,connection) => {
        if(connectionError)return next(connectionError);
        connection.beginTransaction(TransctionError => {
          if(TransctionError){
            connection.release();
            return next(TransctionError);
          }
          let changeStatusSql = "update products set is_active = 0 where id = ?";
          connection.query(changeStatusSql,[id],(err0,res0) => {
            if(err0 || res0.affectedRows === 0){
              return connection.rollback(() => {
                connection.release();
                next(err0 || createError.NotFound('deletion failed, product not found'));
              }) 
            }
    
            let deleteVariants = "delete from product_variants where product_id = ?";
            connection.query(deleteVariants,[id],(err,result) => {
              if(err || result.affectedRows === 0){
                connection.release();
                return connection.rollback(() => next(err || createError.NotFound('No variants found')));
              }
              connection.commit(commitErr => {
                if (commitErr) {
                  connection.release();
                  return connection.rollback(() => next(commitErr));
                }
                
                connection.release();
                return res.send("Product deleted successfully!");
              })  
            })
          })
        })

      })
    }
    else if(!Array.isArray(variants) || variants.length == 0){
      return next(createError.BadRequest('Invalid Request!'));
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