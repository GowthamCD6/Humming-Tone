const db = require("../../config/db");
const createError = require("http-errors");
const { uploadStreamToCloudinary } = require("../../config/cloudinary");

// --- ADD PRODUCT ---
exports.add_product = async (req, res, next) => {
    try {
        const files = req.files;
        if (!files || files.length === 0) {
            return next(createError.BadRequest("At least one image is required"));
        }

        // Upload all images to Cloudinary in parallel
        const uploadedImages = await Promise.all(
            files.map(file => uploadStreamToCloudinary(file.buffer, "hummingtone/products"))
        );

        // Extract secure URLs from Cloudinary
        const imageUrls = uploadedImages.map(img => img.secure_url);
        const primary_image = imageUrls[0];

        const {
            name, about, sku, category, subcategory, brand, color,
            material, care_instructions, gender, age_range, weight,
            dimensions, is_featured, is_active, variants: variantsRaw
        } = req.body;

        db.getConnection((err, connection) => {
            if (err) return next(err);

            connection.beginTransaction(err => {
                if (err) {
                    connection.release();
                    return next(err);
                }

                // 1. Get Category ID (or insert new if not found)
                connection.query(
                    "SELECT id FROM categories WHERE slug = ? OR (name = ? AND gender_name = ?) LIMIT 1",
                    [category, category, gender],
                    (err, catRows) => {
                        if (err) return rollback(err);

                        if (catRows.length > 0) {
                            insertProduct(catRows[0].id);
                        } else {
                            // Category not found, create it dynamically
                            const newSlug = category.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                            const finalSlug = `${gender ? gender.toLowerCase() + '_' : ''}${newSlug}`;
                            
                            connection.query(
                                "INSERT INTO categories (name, slug, gender_name) VALUES (?, ?, ?)",
                                [category, finalSlug, gender || 'General'],
                                (insertErr, result) => {
                                    if (insertErr) return rollback(insertErr);
                                    insertProduct(result.insertId);
                                }
                            );
                        }
                    }
                );

                // 2. Insert Product
                function insertProduct(category_id) {
                    const insertProductSql = `
                        INSERT INTO products 
                        (name, about, sku, category_id, subcategory, brand, color,
                         material, care_instructions, gender, age_range, weight, dimensions,
                         is_featured, is_active, image_path)
                        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
                    `;

                    connection.query(
                        insertProductSql,
                        [
                            name, about, sku, category_id, subcategory, brand, color,
                            material, care_instructions, gender, age_range,
                            weight ? Number(weight) : 0,
                            dimensions,
                            is_featured == '1' ? 1 : 0,
                            is_active == '1' ? 1 : 0,
                            primary_image
                        ],
                        (err, prodResult) => {
                            if (err) return rollback(err);

                            const product_id = prodResult.insertId;
                            insertImages(product_id);
                        }
                    );
                }

                // 3. Insert Images
                function insertImages(product_id) {
                    const imageValues = imageUrls.map((url, index) => [
                        product_id,
                        url,
                        index === 0 ? 1 : 0
                    ]);

                    connection.query(
                        "INSERT INTO product_images (product_id, image_path, is_primary) VALUES ?",
                        [imageValues],
                        err => {
                            if (err) return rollback(err);
                            insertVariants(product_id);
                        }
                    );
                }

                // 4. Insert Variants
                function insertVariants(product_id) {
                    let variants;
                    try {
                        variants = JSON.parse(variantsRaw);
                    } catch {
                        return rollback(createError.BadRequest("Invalid variants format"));
                    }

                    const variantValues = variants.map(v => [
                        product_id,
                        v.size,
                        v.price,
                        v.original_price,
                        v.stock_quantity
                    ]);

                    connection.query(
                        "INSERT INTO product_variants (product_id, size, price, original_price, stock_quantity) VALUES ?",
                        [variantValues],
                        err => {
                            if (err) return rollback(err);

                            connection.commit(err => {
                                if (err) return rollback(err);

                                // Auto-trigger notification for new arrival or featured drop
                                const notifTitle = is_featured == '1' ? `✨ Featured Drop: ${name}` : `🔥 New Arrival: ${name}`;
                                const notifMsg = is_featured == '1'
                                    ? `A new signature piece has been featured in the Humming Tone collection.`
                                    : `Explore the newest ${subcategory || 'Atelier'} addition now in limited stock.`;
                                db.query(
                                    "INSERT INTO notifications (title, message, type, product_id, image_url, is_read) VALUES (?, ?, ?, ?, ?, 0)",
                                    [notifTitle, notifMsg, is_featured == '1' ? 'featured_drop' : 'new_arrival', product_id, primary_image],
                                    (notifErr) => {
                                        if (notifErr) console.warn("Failed to auto-insert notification:", notifErr.message);
                                    }
                                );

                                connection.release();
                                res.status(201).json({
                                    success: true,
                                    message: "Product added!"
                                });
                            });
                        }
                    );
                }

                // Rollback helper
                function rollback(error) {
                    connection.rollback(() => {
                        connection.release();
                        console.error("DB Error:", error);
                        next(error);
                    });
                }
            });
        });
    } catch (error) {
        next(error);
    }
};

// --- FETCH PRODUCTS (ACTIVE ONLY) ---
exports.fetch_products = (req, res, next) => {
    try {
        const getSql = `
            SELECT p.*, 
            (SELECT price FROM product_variants WHERE product_id = p.id ORDER BY id ASC LIMIT 1) AS price,
            (SELECT SUM(stock_quantity) FROM product_variants WHERE product_id = p.id) AS stock_quantity
            FROM products p 
            WHERE p.is_active = 1
            ORDER BY p.id DESC
        `;

        db.query(getSql, (error, rows) => {
            if (error) {
                return next(error);
            }

            res.status(200).json(rows || []);
        });

    } catch (error) {
        next(error);
    }
};

// --- FETCH DELETED PRODUCTS (INACTIVE) ---
exports.fetch_deleted_products = (req, res, next) => {
    try {
        const getSql = `
            SELECT p.*, 
            (SELECT price FROM product_variants WHERE product_id = p.id LIMIT 1) AS price,
            (SELECT SUM(stock_quantity) FROM product_variants WHERE product_id = p.id) AS stock_quantity
            FROM products p 
            WHERE p.is_active = 0
            ORDER BY p.id DESC
        `;

        db.query(getSql, (error, rows) => {
            if (error) {
                return next(error);
            }

            res.status(200).json(rows || []);
        });

    } catch (error) {
        next(error);
    }
};


// --- FETCH VARIANTS ---
exports.fetch_variants = (req, res, next) => {
  try {
    const { id } = req.params;

    const sql = `
      SELECT
          p.id,
          p.name,
          p.about,
          p.sku,
          p.category_id,
          c.name AS category_name,
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

          (
            SELECT JSON_ARRAYAGG(
              JSON_OBJECT(
                'image_path', pi.image_path,
                'is_primary', pi.is_primary
              )
            )
            FROM product_images pi
            WHERE pi.product_id = p.id
          ) AS images,

          (
            SELECT JSON_ARRAYAGG(
              JSON_OBJECT(
                'size', v.size,
                'price', v.price,
                'original_price', v.original_price,
                'stock_quantity', v.stock_quantity
              )
            )
            FROM product_variants v
            WHERE v.product_id = p.id
          ) AS variants

      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?;
    `;

    db.query(sql, [id], (err, rows) => {
      if (err) return next(err);
      res.status(200).json(rows[0] || {});
    });

  } catch (error) {
    next(error);
  }
};

// --- UPDATE VARIANT ---
exports.update_variant = (req, res, next) => {
    try {
        const { id } = req.params;
        const { price, original_price, stock_quantity } = req.body;

        db.query(
            "UPDATE product_variants SET price=?, original_price=?, stock_quantity=? WHERE id=?",
            [price, original_price, stock_quantity, id],
            (err, result) => {
                if (err) return next(err);

                if (result.affectedRows === 0) {
                    return next(createError.NotFound("Variant not found"));
                }

                res.json({ message: "Variant updated" });
            }
        );
    } catch (error) {
        next(error);
    }
};


// --- UPDATE PRODUCT (WITH TRANSACTION & CLOUDINARY) ---
exports.update_product = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, sku, price, stock, category, gender, about, is_featured } = req.body;

        let uploadedImageUrl = null;
        if (req.file) {
            const uploadedResult = await uploadStreamToCloudinary(req.file.buffer, "hummingtone/products");
            uploadedImageUrl = uploadedResult.secure_url;
        }

        db.getConnection((err, connection) => {
            if (err) return next(err);

            connection.beginTransaction(err => {
                if (err) {
                    connection.release();
                    return next(err);
                }

                // 1. Get or Create Category ID
                connection.query(
                    "SELECT id FROM categories WHERE slug = ? OR (name = ? AND gender_name = ?) LIMIT 1",
                    [category, category, gender],
                    (err, catRows) => {
                        if (err) return rollback(err);

                        if (catRows.length > 0) {
                            updateProductWithCategory(catRows[0].id);
                        } else {
                            const newSlug = category.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                            const finalSlug = `${gender ? gender.toLowerCase() + '_' : ''}${newSlug}`;
                            
                            connection.query(
                                "INSERT INTO categories (name, slug, gender_name) VALUES (?, ?, ?)",
                                [category, finalSlug, gender || 'General'],
                                (insertErr, result) => {
                                    if (insertErr) return rollback(insertErr);
                                    updateProductWithCategory(result.insertId);
                                }
                            );
                        }
                    }
                );

                function updateProductWithCategory(category_id) {
                    const featuredVal = is_featured !== undefined ? (is_featured == 1 || is_featured === true || is_featured === '1' || is_featured === 'true' ? 1 : 0) : null;
                    const updateSql = featuredVal !== null 
                        ? "UPDATE products SET name=?, sku=?, category_id=?, subcategory=?, gender=?, about=?, is_featured=? WHERE id=?"
                        : "UPDATE products SET name=?, sku=?, category_id=?, subcategory=?, gender=?, about=? WHERE id=?";
                    const updateParams = featuredVal !== null
                        ? [name, sku, category_id, category, gender, about, featuredVal, id]
                        : [name, sku, category_id, category, gender, about, id];

                    connection.query(
                        updateSql,
                        updateParams,
                        err => {
                            if (err) return rollback(err);

                            connection.query(
                                `UPDATE product_variants pv
                                 JOIN (
                                   SELECT id
                                   FROM product_variants
                                   WHERE product_id = ?
                                   ORDER BY id ASC
                                   LIMIT 1
                                 ) first_variant ON first_variant.id = pv.id
                                 SET pv.price = ?, pv.stock_quantity = ?`,
                                [id, Number(price), Number(stock)],
                                err => {
                                    if (err) return rollback(err);

                                    // If a new image was uploaded to Cloudinary, update the primary image
                                    if (uploadedImageUrl) {
                                        connection.query(
                                            "UPDATE product_images SET image_path=? WHERE product_id=? AND is_primary=1 LIMIT 1",
                                            [uploadedImageUrl, id],
                                            (imgErr, imgResult) => {
                                                if (imgErr) return rollback(imgErr);
                                                
                                                // If no primary image row existed, insert one
                                                if (imgResult.affectedRows === 0) {
                                                    connection.query(
                                                        "INSERT INTO product_images (product_id, image_path, is_primary) VALUES (?, ?, 1)",
                                                        [id, uploadedImageUrl],
                                                        (insertErr) => {
                                                            if (insertErr) return rollback(insertErr);
                                                            commitAndRespond();
                                                        }
                                                    );
                                                } else {
                                                    commitAndRespond();
                                                }
                                            }
                                        );
                                    } else {
                                        commitAndRespond();
                                    }
                                }
                            );
                        }
                    );

                    function commitAndRespond() {
                        connection.commit(err => {
                            if (err) return rollback(err);
                            connection.release();
                            res.json({
                                success: true,
                                message: "Product updated successfully!"
                            });
                        });
                    }
                }

                function rollback(error) {
                    connection.rollback(() => {
                        connection.release();
                        console.error("Update Error:", error);
                        next(error);
                    });
                }
            });
        });
    } catch (error) {
        next(error);
    }
};


// --- SOFT DELETE PRODUCT (SET is_active = 0) ---
exports.delete_product = (req, res, next) => {
    const { id } = req.body;

    if (!id) {
        return res.status(400).json({ success: false, message: "Product ID is required" });
    }

    const updateSql = "UPDATE products SET is_active = 0 WHERE id = ?";
    
    db.query(updateSql, [id], (error, result) => {
        if (error) {
            return next(error);
        }
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }
        
        res.json({
            success: true,
            message: "Product moved to deleted products"
        });
    });
};

// --- RESTORE PRODUCT (SET is_active = 1) ---
exports.restore_product = (req, res, next) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ success: false, message: "Product ID is required" });
    }

    const updateSql = "UPDATE products SET is_active = 1 WHERE id = ?";
    
    db.query(updateSql, [id], (error, result) => {
        if (error) {
            return next(error);
        }
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }
        
        res.json({
            success: true,
            message: "Product restored successfully"
        });
    });
};

// --- TOGGLE FEATURED STATUS ---
exports.toggle_featured = (req, res, next) => {
    try {
        const { id } = req.params;
        const { is_featured } = req.body;

        if (is_featured !== undefined) {
            const featuredVal = is_featured == 1 || is_featured === true || is_featured === '1' || is_featured === 'true' ? 1 : 0;
            db.query(
                "UPDATE products SET is_featured = ? WHERE id = ?",
                [featuredVal, id],
                (err, result) => {
                    if (err) return next(err);
                    if (result.affectedRows === 0) return next(createError.NotFound("Product not found"));
                    return res.status(200).json({
                        success: true,
                        is_featured: featuredVal,
                        message: `Product marked as ${featuredVal ? 'Featured' : 'Normal'}`
                    });
                }
            );
        } else {
            // Toggle existing value
            db.query(
                "UPDATE products SET is_featured = CASE WHEN is_featured = 1 THEN 0 ELSE 1 END WHERE id = ?",
                [id],
                (err, result) => {
                    if (err) return next(err);
                    if (result.affectedRows === 0) return next(createError.NotFound("Product not found"));

                    db.query("SELECT is_featured FROM products WHERE id = ?", [id], (selErr, rows) => {
                        if (selErr) return next(selErr);
                        const newStatus = rows[0]?.is_featured || 0;
                        return res.status(200).json({
                            success: true,
                            is_featured: newStatus,
                            message: `Product is now ${newStatus ? 'Featured' : 'Normal'}`
                        });
                    });
                }
            );
        }
    } catch (error) {
        next(error);
    }
};

// --- EXPORT COMPREHENSIVE PRODUCT CATALOG WITH IMAGES & VARIANTS ---
exports.getExportProductsData = async (req, res, next) => {
    try {
        const { category, gender, featured } = req.query;

        let whereClauses = ["p.is_active = 1"];
        let params = [];

        if (category && category !== 'All') {
            whereClauses.push("(p.subcategory = ? OR c.name = ?)");
            params.push(category, category);
        }

        if (gender && gender !== 'All') {
            whereClauses.push("LOWER(p.gender) = LOWER(?)");
            params.push(gender);
        }

        if (featured === '1' || featured === 'true') {
            whereClauses.push("p.is_featured = 1");
        } else if (featured === '0' || featured === 'false') {
            whereClauses.push("(p.is_featured = 0 OR p.is_featured IS NULL)");
        }

        const whereSql = `WHERE ${whereClauses.join(" AND ")}`;

        const sql = `
            SELECT 
                p.id,
                p.name,
                p.sku,
                p.about,
                p.subcategory AS category,
                c.name AS category_name,
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
                p.created_at,
                p.updated_at,
                COALESCE(
                    (SELECT pi.image_path FROM product_images pi WHERE pi.product_id = p.id AND pi.is_primary = 1 LIMIT 1),
                    (SELECT pi.image_path FROM product_images pi WHERE pi.product_id = p.id LIMIT 1),
                    p.image_path
                ) AS primary_image,
                (SELECT MIN(price) FROM product_variants WHERE product_id = p.id) AS min_price,
                (SELECT MAX(price) FROM product_variants WHERE product_id = p.id) AS max_price,
                (SELECT SUM(stock_quantity) FROM product_variants WHERE product_id = p.id) AS total_stock
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            ${whereSql}
            ORDER BY p.id DESC
        `;

        const [products] = await db.promise().query(sql, params);

        if (!products || products.length === 0) {
            return res.status(200).json({ success: true, products: [], count: 0 });
        }

        const productIds = products.map(p => p.id);
        const placeholders = productIds.map(() => '?').join(',');

        const variantsSql = `
            SELECT product_id, size, price, original_price, stock_quantity
            FROM product_variants
            WHERE product_id IN (${placeholders})
            ORDER BY id ASC
        `;

        const [variants] = await db.promise().query(variantsSql, productIds);

        const variantsByProd = {};
        variants.forEach(v => {
            if (!variantsByProd[v.product_id]) variantsByProd[v.product_id] = [];
            variantsByProd[v.product_id].push(v);
        });

        const fullProducts = products.map(prod => {
            const vList = variantsByProd[prod.id] || [];
            return {
                ...prod,
                variants: vList,
                sizes_list: vList.map(v => v.size).join(', '),
                variant_summary: vList.map(v => `${v.size}: ₹${v.price} (Stock: ${v.stock_quantity})`).join(' | ')
            };
        });

        res.status(200).json({
            success: true,
            products: fullProducts,
            count: fullProducts.length
        });

    } catch (error) {
        console.error("Export products error:", error);
        next(error);
    }
};


