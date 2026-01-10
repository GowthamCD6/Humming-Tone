const express = require('express');
const router = express.Router();
const customizeController = require('../../controllers/admin/customize');

// Admin customize configuration (used by AdminCystamize)
router.get('/site-content/customize', customizeController.getCustomize);
router.post('/site-content/customize', customizeController.updateCustomize);

module.exports = router;
