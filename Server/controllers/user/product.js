const createError = require("http-errors");
const db = require("../../config/db");

exports.fetch_products = (req,res,next) => { // api request can be /user/fetch_products?gender=men&category=T-Shirts
    const { gender, category } = req.query;
    
    try {
      let fetchSql = `SELECT 
                        p.id,
                        p.name,
                        p.brand,
                        COALESCE(MAX(c.name), p.subcategory) as category,
                        p.gender,
                        p.is_featured,
                        COALESCE(
                            p.image_path,
                            (
                                SELECT pi.image_path
                                FROM product_images pi
                                WHERE pi.product_id = p.id
                                ORDER BY pi.is_primary DESC, pi.id ASC
                                LIMIT 1
                            )
                        ) AS image_path,
                        MIN(pv.price) AS price,
                        SUM(pv.stock_quantity) AS total_stock
                        FROM products p
                        LEFT JOIN categories c ON p.category_id = c.id
                        LEFT JOIN product_variants pv 
                        ON pv.product_id = p.id
                        LEFT JOIN genders g ON LOWER(g.name) = LOWER(p.gender)
                        WHERE p.is_active = 1
                          AND (g.is_active IS NULL OR g.is_active = 1)`;

      const params = [];

      // If a gender is provided, filter by it. Otherwise, fetch all active products.
      if (gender && gender.trim() !== "" && gender.toLowerCase() !== "all" && gender.toLowerCase() !== "all gender") {
        const normalizedGender = gender.toLowerCase() === 'baby' ? 'babies' : gender.toLowerCase();
        fetchSql += ` AND (LOWER(p.gender) = LOWER(?) OR LOWER(p.gender) = LOWER(?))`;
        params.push(gender.trim(), normalizedGender);
      }

      // If category is provided, filter by category name or subcategory
      if (category && category.trim() !== "" && category.toLowerCase() !== "all" && category.toLowerCase() !== "all categories") {
        fetchSql += ` AND (LOWER(c.name) = LOWER(?) OR LOWER(p.subcategory) = LOWER(?))`;
        params.push(category.trim(), category.trim());
      }

      fetchSql += ` GROUP BY p.id, p.name, p.brand, p.subcategory, p.gender, p.is_featured, p.image_path, p.created_at ORDER BY p.created_at DESC`;

      db.query(fetchSql, params, (error, result) => {
        if(error){
            return next(error);
        }
        // If result is empty, just return an empty array instead of 404
        res.send(result || []);
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
        p.id,
        p.name,
        p.about,
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
        p.is_featured,
        p.is_active,
        p.image_path,
        p.created_at,
        p.updated_at,
        MIN(pv.price) AS price,
        MIN(pv.original_price) AS original_price,
        SUM(pv.stock_quantity) AS stock_quantity
      FROM products p
      LEFT JOIN product_variants pv ON p.id = pv.product_id
      WHERE p.is_active = 1
      GROUP BY p.id, p.name, p.about, p.sku, p.category_id, p.subcategory, p.brand, p.color, p.material, p.care_instructions, p.gender, p.age_range, p.weight, p.dimensions, p.is_featured, p.is_active, p.image_path, p.created_at, p.updated_at
      ORDER BY p.created_at DESC
      LIMIT 9
    `;

    db.query(sql, [], (error, result) => {
      if (error) {
        console.error("fetch_new_arrivals error:", error);
        return next(error);
      }
      res.send(result || []);
    });
  } catch (error) {
    next(error);
  }
};

exports.fetch_featured_products = (req, res, next) => {
  try {
    const sql = `
      SELECT
        p.id,
        p.name,
        p.about,
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
        p.is_featured,
        p.is_active,
        p.image_path,
        p.created_at,
        p.updated_at,
        MIN(pv.price) AS price,
        MIN(pv.original_price) AS original_price,
        SUM(pv.stock_quantity) AS stock_quantity
      FROM products p
      LEFT JOIN product_variants pv ON p.id = pv.product_id
      WHERE p.is_featured = 1
        AND p.is_active = 1
      GROUP BY p.id, p.name, p.about, p.sku, p.category_id, p.subcategory, p.brand, p.color, p.material, p.care_instructions, p.gender, p.age_range, p.weight, p.dimensions, p.is_featured, p.is_active, p.image_path, p.created_at, p.updated_at
      ORDER BY p.created_at DESC
    `;

    db.query(sql, [], (error, result) => {
      if (error) {
        console.error("fetch_featured_products error:", error);
        return next(error);
      }
      res.send(result || []);
    });
  } catch (error) {
    next(error);
  }
};

exports.fetch_recommendations = (req, res, next) => {
  try {
    const category_id = req.body?.category_id || req.query?.category_id;
    const exclude_id = req.body?.exclude_id || req.body?.product_id || req.query?.exclude_id || req.query?.product_id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 4;
    const offset = (page - 1) * limit;

    let sql = `
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
      WHERE p.is_active = 1
    `;
    const params = [];

    if (category_id) {
      sql += ` AND p.category_id = ?`;
      params.push(category_id);
    }

    if (exclude_id) {
      sql += ` AND p.id != ?`;
      params.push(exclude_id);
    }

    sql += `
      GROUP BY p.id
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?;
    `;
    params.push(limit, offset);

    db.query(sql, params, (err, rows) => {
      if (err) return next(err);

      // If we have fewer than limit recommendations (e.g. fewer than 4),
      // backfill from other active products so user always sees 4 cards
      if (rows && rows.length < limit) {
        const needed = limit - rows.length;
        const alreadyIds = [exclude_id, ...(rows || []).map(r => r.id)].filter(Boolean);

        let backfillSql = `
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
          WHERE p.is_active = 1
        `;
        const backfillParams = [];
        if (alreadyIds.length > 0) {
          backfillSql += ` AND p.id NOT IN (?)`;
          backfillParams.push(alreadyIds);
        }
        backfillSql += `
          GROUP BY p.id
          ORDER BY p.is_featured DESC, p.created_at DESC
          LIMIT ?;
        `;
        backfillParams.push(needed);

        db.query(backfillSql, backfillParams, (err2, backfillRows) => {
          if (err2) {
            return res.status(200).json({
              page,
              limit,
              count: rows.length,
              data: rows
            });
          }
          const combined = [...rows, ...(backfillRows || [])];
          return res.status(200).json({
            page,
            limit,
            count: combined.length,
            data: combined
          });
        });
      } else {
        res.status(200).json({
          page,
          limit,
          count: rows.length,
          data: rows
        });
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.fetch_categories = (req, res, next) => {
  try {
    const { gender } = req.query;
    let sql = `SELECT c.name AS category 
               FROM categories c 
               LEFT JOIN genders g ON LOWER(g.name) = LOWER(c.gender_name)
               WHERE (g.is_active IS NULL OR g.is_active = 1)`;
    const params = [];

    if (gender && gender !== 'All' && gender !== 'All Gender') {
      sql += ` AND LOWER(c.gender_name) = LOWER(?)`;
      params.push(gender);
    }
    
    sql += ` GROUP BY c.name ORDER BY c.name ASC`;

    db.query(sql, params, (error, result) => {
      if (error) return next(error);
      const categories = result.map(row => row.category);
      res.send(categories);
    });
  } catch (error) {
    next(error);
  }
};