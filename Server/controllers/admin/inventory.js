const db = require('../../config/db');

exports.fetch_inventory = (req, res) => {
  const query = `
    SELECT 
      v.id as material_id,
      p.id as product_id,
      p.sku as material_code,
      p.name as material_name,
      c.name as category,
      p.brand as preferred_supplier,
      v.stock_quantity as current_stock,
      v.price as standard_cost,
      v.size as unit_of_measurement,
      p.gender,
      p.color,
      p.material,
      p.care_instructions,
      p.age_range,
      p.weight,
      p.dimensions,
      p.about,
      5 as reorder_level
    FROM product_variants v
    JOIN products p ON v.product_id = p.id
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.is_active = 1
    ORDER BY p.id DESC, v.id ASC
  `;
  db.query(query, (err, results) => {
    if (err) {
      console.error("Fetch Inventory Error:", err);
      return res.status(500).json({ success: false, message: "Database error" });
    }
    return res.status(200).json({ success: true, data: results });
  });
};

exports.update_inventory_full = (req, res) => {
  const { id } = req.params; // variant id
  const {
    product_id,
    material_name,
    material_code,
    preferred_supplier,
    gender,
    color,
    material,
    care_instructions,
    age_range,
    weight,
    dimensions,
    about,
    current_stock,
    standard_cost
  } = req.body;

  if (!product_id) {
    return res.status(400).json({ success: false, message: "Product ID is required" });
  }

  // Transaction to update both tables
  db.getConnection((err, connection) => {
    if (err) return res.status(500).json({ success: false, message: "Database connection error" });
    
    connection.beginTransaction(err => {
      if (err) {
        connection.release();
        return res.status(500).json({ success: false, message: "Transaction start error" });
      }

      // Update variant
      const variantQuery = `UPDATE product_variants SET stock_quantity = ?, price = ? WHERE id = ?`;
      connection.query(variantQuery, [current_stock, standard_cost, id], (err, varResult) => {
        if (err) {
          return connection.rollback(() => {
            connection.release();
            res.status(500).json({ success: false, message: "Variant update error" });
          });
        }

        // Update product
        const productQuery = `
          UPDATE products SET 
            name = ?, sku = ?, brand = ?, gender = ?, color = ?, 
            material = ?, care_instructions = ?, age_range = ?, weight = ?, 
            dimensions = ?, about = ?
          WHERE id = ?
        `;
        const productValues = [
          material_name, material_code, preferred_supplier, gender, color,
          material, care_instructions, age_range, weight, dimensions, about,
          product_id
        ];

        connection.query(productQuery, productValues, (err, prodResult) => {
          if (err) {
            return connection.rollback(() => {
              connection.release();
              res.status(500).json({ success: false, message: "Product update error" });
            });
          }

          connection.commit(err => {
            if (err) {
              return connection.rollback(() => {
                connection.release();
                res.status(500).json({ success: false, message: "Commit error" });
              });
            }
            connection.release();
            res.status(200).json({ success: true, message: "Inventory updated successfully" });
          });
        });
      });
    });
  });
};

exports.update_inventory = (req, res) => {
  const { id } = req.params; // mapped to variant_id
  const { current_stock, standard_cost } = req.body;
  
  if (current_stock === undefined && standard_cost === undefined) {
    return res.status(400).json({ success: false, message: "No fields to update" });
  }

  let updateFields = [];
  let values = [];

  if (current_stock !== undefined) {
    updateFields.push("stock_quantity = ?");
    values.push(Number(current_stock));
  }
  if (standard_cost !== undefined) {
    updateFields.push("price = ?");
    values.push(Number(standard_cost));
  }

  values.push(id);

  const query = `UPDATE product_variants SET ${updateFields.join(", ")} WHERE id = ?`;

  db.query(query, values, (err, result) => {
    if (err) {
      console.error("Update Inventory Error:", err);
      return res.status(500).json({ success: false, message: "Database error" });
    }
    if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: "Variant not found" });
    }
    return res.status(200).json({ success: true, message: "Inventory updated successfully" });
  });
};
