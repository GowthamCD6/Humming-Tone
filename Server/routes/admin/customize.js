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

// Preset Artwork & Motifs / Designs (used by both Admin and Storefront)
router.get('/site-content/customize/designs', customizeController.getDesigns);
router.post(
	'/site-content/customize/designs',
	adminAuth,
	upload.single('image'),
	customizeController.saveDesign
);
router.delete('/site-content/customize/designs/:id', adminAuth, customizeController.deleteDesign);
router.patch('/site-content/customize/designs/:id/status', adminAuth, customizeController.toggleDesignStatus);

// Fabric & Materials Management
router.get('/site-content/customize/materials', customizeController.getMaterials);
router.post('/site-content/customize/materials', adminAuth, customizeController.saveMaterial);
router.delete('/site-content/customize/materials/:id', adminAuth, customizeController.deleteMaterial);
router.patch('/site-content/customize/materials/:id/status', adminAuth, customizeController.toggleMaterialStatus);

// Sizes & Fit Management
router.get('/site-content/customize/sizes', customizeController.getSizes);
router.post('/site-content/customize/sizes', adminAuth, customizeController.saveSize);
router.delete('/site-content/customize/sizes/:id', adminAuth, customizeController.deleteSize);
router.patch('/site-content/customize/sizes/:id/status', adminAuth, customizeController.toggleSizeStatus);

module.exports = router;


