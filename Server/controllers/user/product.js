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
    const sql = `
      SELECT
        p.id AS id,                     -- ✅ product id
        p.name,
        p.about,
        pv.original_price,
        p.sku,
        p.category_id,
        p.subcategory,
        p.brand,
        p.color,
        p.material,
        p.care_instructions,
        p.gender,
        p.age_range,
        p.weight,
        p.dimensions,
        pv.stock_quantity,
        p.is_featured,
        p.is_active,
        p.image_path,
        p.created_at,
        p.updated_at,

        pv.id AS variant_id,            -- ✅ variant id (separate)
        pv.size,
        pv.price
      FROM products p
      JOIN product_variants pv ON p.id = pv.product_id
      WHERE p.is_active = 1
      ORDER BY p.created_at DESC
      LIMIT 9
    `;

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
    const sql = `
      SELECT
        p.id AS id,                   
        p.name,
        p.about,
        pv.original_price,
        p.sku,
        p.category_id,
        p.subcategory,
        p.brand,
        p.color,
        p.material,
        p.care_instructions,
        p.gender,
        p.age_range,
        p.weight,
        p.dimensions,
        pv.stock_quantity,
        p.is_featured,
        p.is_active,
        p.image_path,
        p.created_at,
        p.updated_at,

        pv.id AS variant_id,
        pv.size,
        pv.price
      FROM products p
      JOIN product_variants pv ON p.id = pv.product_id
      WHERE p.is_featured = 1
        AND p.is_active = 1
      ORDER BY p.created_at DESC
    `;

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

exports.fetch_recommendations = (req, res, next) => {
  try {
    const category_id = req.body.category_id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 3;
    const offset = (page - 1) * limit;

    if (!category_id) {
      return next(createError.BadRequest('invalid category id!'));
    }

    const sql = `
      SELECT
        p.id,
        p.name,
        p.brand,
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
      JOIN product_variants pv ON pv.product_id = p.id
      WHERE p.category_id = ?
        AND p.is_active = 1
      GROUP BY p.id
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?;
    `;

    db.query(sql, [category_id, limit, offset], (err, rows) => {
      if (err) return next(err);

      res.status(200).json({
        page,
        limit,
        count: rows.length,
        data: rows
      });
    });
  } catch (error) {
    next(error);
  }
};
