const createError = require("http-errors");
const db = require("../../config/db");

exports.fetch_products = (req,res,next) => {
    try{
      let fetchSql = `SELECT 
                        p.id,
                        p.name,
                        p.brand,
                        p.subcategory,
                        p.gender,
                        p.is_featured,
                        (
                            SELECT pi.image_path
                            FROM product_images pi
                            WHERE pi.product_id = p.id
                            AND pi.is_primary = 1
                            LIMIT 1
                        ) AS image_path,
                        MIN(pv.price) AS price,
                        SUM(pv.stock_quantity) AS total_stock
                        FROM products p
                        LEFT JOIN product_variants pv 
                        ON pv.product_id = p.id
                        WHERE p.is_active = 1
                        GROUP BY p.id;`;
      db.query(fetchSql,(error,result) => {
        if(error || result.length === 0){
            return next(error || createError.NotFound('Products not found!'));
        }
        res.send(result);
      })
    }
    catch(error){
        next(error);
    }
}