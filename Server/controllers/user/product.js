const createError = require("http-errors");
const db = require("../../config/db");

exports.fetch_products = (req,res,next) => { // api request should be /user/fetch_products?gender=men
    const{gender} = req.query;
    if(gender === undefined || gender == null || !gender || gender.trim() === ""){
      return next(createError.BadRequest('gender not found!'));
    }
    const allowedGenders = ['men', 'women', 'children', 'babies', 'sports'];
    if(!allowedGenders.includes(gender))return next(createError.BadRequest('Invalid Gender!'));
    try{
      let fetchSql = `SELECT 
                        p.id,
                        p.name,
                        p.brand,
                        p.subcategory,
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
                        WHERE p.is_active = 1 and p.gender = ?
                        GROUP BY p.id order by created_at DESC`;
      db.query(fetchSql,[gender],(error,result) => {
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

  exports.fetch_new_arrivals = (req, res, next) => {
    try {
      let sql = "select * from products p join product_variants pv on p.id = pv.product_id where is_active = 1 order by created_at DESC limit 9";
      db.query(sql, (error, result) => {  
        if (error || result.length === 0) {
          return next(createError.BadRequest(error || createError.NotFound('Products not found!')));
        }
        res.send(result);
      });
    } catch (error) {
      next(error);
    }
  };

exports.fetch_featured_products = (req, res, next) => {
  try {
    let sql = "select * from products p join product_variants pv on p.id = pv.product_id where is_featured = 1 and is_active = 1 order by p.created_at DESC";
    db.query(sql, (error, result) => {  
      if (error || result.length === 0) {
        return next(createError.BadRequest(error || createError.NotFound('Products not found!')));
      }
      res.send(result);
    });
  } catch (error) {
    next(error);
  }
};