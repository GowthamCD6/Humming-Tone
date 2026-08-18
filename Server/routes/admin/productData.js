const express = require('express');
const router = express.Router();
const productController = require('../../controllers/admin/productData');


// Get all products with filters
router.get('/', productController.getAllProducts);

// Delete single product
router.delete('/:id', productController.deleteProduct);

// Delete multiple products
router.post('/delete-multiple', productController.deleteMultipleProducts);

// Delete all products
router.delete('/', productController.deleteAllProducts);

// Restore product status (set is_active = 1)
router.patch('/:id/restore', productController.restoreProduct);

module.exports = router;
