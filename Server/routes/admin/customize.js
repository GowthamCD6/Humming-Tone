const express = require('express');
const router = express.Router();
const customizeController = require('../../controllers/admin/customize');
const adminAuth = require('../../middlewares/adminAuth');

// Admin customize configuration (used by AdminCustomize)
router.get('/site-content/customize', customizeController.getCustomize);
router.post('/site-content/customize', adminAuth, customizeController.updateCustomize);

module.exports = router;
