const db = require('../../config/db');

exports.fetch_inventory = (req, res) => {
  const query = `
    SELECT 
      v.id as material_id,
      p.sku as material_code,
      p.name as material_name,
      c.name as category,
      p.brand as preferred_supplier,
      v.stock_quantity as current_stock,
      v.price as standard_cost,
      v.size as unit_of_measurement,
      p.gender,
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
