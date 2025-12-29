const db = require('../../config/db');

// Get all products with optional filters
exports.getAllProducts = async (req, res) => {
  let connection;
  try {
    const { category, gender, status } = req.query;

    // Get connection from pool using promise()
    connection = await db.promise().getConnection();

    let query = `
      SELECT 
        p.id,
        p.name,
        p.sku,
        p.original_price as price,
        p.stock_quantity as stock,
        p.category_id,
        c.name as category,
        p.gender,
        p.is_active as status,
        p.image_path as image
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `;

    const params = [];

    // Apply filters
    if (category) {
      query += ` AND c.name = ?`;
      params.push(category);
    }

    if (gender) {
      query += ` AND p.gender = ?`;
      params.push(gender.toLowerCase());
    }

    if (status) {
      const isActive = status === 'Active' ? 1 : 0;
      query += ` AND p.is_active = ?`;
      params.push(isActive);
    }

    query += ` ORDER BY p.created_at DESC`;

    const [products] = await connection.query(query, params);

    // Transform data to match frontend expectations
    const transformedProducts = products.map(product => ({
      _id: product.id.toString(),
      id: product.id,
      name: product.name,
      sku: product.sku,
      price: parseFloat(product.price || 0),
      stock: product.stock,
      category: product.category || 'Uncategorized',
      gender: capitalizeFirst(product.gender || ''),
      status: product.status === 1 ? 'Active' : 'Inactive',
      image: product.image || null
    }));

    res.status(200).json({
      success: true,
      count: transformedProducts.length,
      data: transformedProducts
    });

  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: error.message
    });
  } finally {
    if (connection) connection.release();
  }
};

// Delete single product
exports.deleteProduct = async (req, res) => {
  let connection;
  try {
    const { id } = req.params;

    connection = await db.promise().getConnection();

    // Check if product exists
    const [product] = await connection.query('SELECT id FROM products WHERE id = ?', [id]);
    
    if (product.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Start transaction
    await connection.beginTransaction();

    try {
      // Check if tables exist and delete related records
      const [tables] = await connection.query("SHOW TABLES LIKE 'product_images'");
      if (tables.length > 0) {
        await connection.query('DELETE FROM product_images WHERE product_id = ?', [id]);
      }

      const [sizeTables] = await connection.query("SHOW TABLES LIKE 'product_sizes'");
      if (sizeTables.length > 0) {
        await connection.query('DELETE FROM product_sizes WHERE product_id = ?', [id]);
      }
      
      // Delete the product
      await connection.query('DELETE FROM products WHERE id = ?', [id]);

      // Commit transaction
      await connection.commit();

      res.status(200).json({
        success: true,
        message: 'Product deleted successfully'
      });
    } catch (err) {
      await connection.rollback();
      throw err;
    }

  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting product',
      error: error.message
    });
  } finally {
    if (connection) connection.release();
  }
};

// Delete multiple products
exports.deleteMultipleProducts = async (req, res) => {
  let connection;
  try {
    const { productIds } = req.body;

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of product IDs'
      });
    }

    connection = await db.promise().getConnection();

    // Convert string IDs to integers
    const ids = productIds.map(id => parseInt(id));
    const placeholders = ids.map(() => '?').join(',');

    // Start transaction
    await connection.beginTransaction();

    try {
      // Check if tables exist and delete related records
      const [tables] = await connection.query("SHOW TABLES LIKE 'product_images'");
      if (tables.length > 0) {
        await connection.query(`DELETE FROM product_images WHERE product_id IN (${placeholders})`, ids);
      }

      const [sizeTables] = await connection.query("SHOW TABLES LIKE 'product_sizes'");
      if (sizeTables.length > 0) {
        await connection.query(`DELETE FROM product_sizes WHERE product_id IN (${placeholders})`, ids);
      }
      
      // Delete the products
      const [result] = await connection.query(`DELETE FROM products WHERE id IN (${placeholders})`, ids);

      // Commit transaction
      await connection.commit();

      res.status(200).json({
        success: true,
        message: `${result.affectedRows} product(s) deleted successfully`,
        deletedCount: result.affectedRows
      });
    } catch (err) {
      await connection.rollback();
      throw err;
    }

  } catch (error) {
    console.error('Error deleting multiple products:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting products',
      error: error.message
    });
  } finally {
    if (connection) connection.release();
  }
};

// Delete all products
exports.deleteAllProducts = async (req, res) => {
  let connection;
  try {
    connection = await db.promise().getConnection();

    // Start transaction
    await connection.beginTransaction();

    try {
      // Check if tables exist and delete related records
      const [tables] = await connection.query("SHOW TABLES LIKE 'product_images'");
      if (tables.length > 0) {
        await connection.query('DELETE FROM product_images');
      }

      const [sizeTables] = await connection.query("SHOW TABLES LIKE 'product_sizes'");
      if (sizeTables.length > 0) {
        await connection.query('DELETE FROM product_sizes');
      }
      
      // Delete all products
      const [result] = await connection.query('DELETE FROM products');

      // Commit transaction
      await connection.commit();

      res.status(200).json({
        success: true,
        message: `All products deleted successfully`,
        deletedCount: result.affectedRows
      });
    } catch (err) {
      await connection.rollback();
      throw err;
    }

  } catch (error) {
    console.error('Error deleting all products:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting all products',
      error: error.message
    });
  } finally {
    if (connection) connection.release();
  }
};

// Restore product (set is_active = 1)
exports.restoreProduct = async (req, res) => {
  let connection;
  try {
    const { id } = req.params;

    connection = await db.promise().getConnection();

    // Check if product exists
    const [product] = await connection.query('SELECT id FROM products WHERE id = ?', [id]);
    
    if (product.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Update product status to active
    await connection.query('UPDATE products SET is_active = 1 WHERE id = ?', [id]);

    res.status(200).json({
      success: true,
      message: 'Product restored successfully'
    });

  } catch (error) {
    console.error('Error restoring product:', error);
    res.status(500).json({
      success: false,
      message: 'Error restoring product',
      error: error.message
    });
  } finally {
    if (connection) connection.release();
  }
};

// Helper function
function capitalizeFirst(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}