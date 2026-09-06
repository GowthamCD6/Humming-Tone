const express = require('express');
const router = express.Router();
const customizeController = require('../../controllers/admin/customize');
const adminAuth = require('../../middlewares/adminAuth');

const upload = require('../../middlewares/upload');

// Admin customize configuration (used by AdminCustomize)
router.get('/site-content/customize', customizeController.getCustomize);
router.post('/site-content/customize', adminAuth, customizeController.updateCustomize);

// Plain T-Shirts with Front & Back Images (supports direct multipart file uploads or URLs)
router.get('/site-content/customize/plain-tshirts', customizeController.getPlainTshirts);
router.post(
	'/site-content/customize/plain-tshirts',
	adminAuth,
	upload.fields([
		{ name: 'front_image', maxCount: 1 },
		{ name: 'back_image', maxCount: 1 }
	]),
	customizeController.savePlainTshirt
);
router.delete('/site-content/customize/plain-tshirts/:id', adminAuth, customizeController.deletePlainTshirt);

module.exports = router;
