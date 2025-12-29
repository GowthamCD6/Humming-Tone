const express = require('express');
const router = express.Router();
const productController = require('../../controllers/admin/productData');


// Get all products with filters
router.get('/products', productController.getAllProducts);

// Delete single product
router.delete('/products/:id', productController.deleteProduct);

// Delete multiple products
router.post('/products/delete-multiple', productController.deleteMultipleProducts);

// Delete all products
router.delete('/products', productController.deleteAllProducts);

// Restore product status (set is_active = 1)
router.patch('/products/:id/restore', productController.restoreProduct);

module.exports = router;
