const express = require('express');
const router = express.Router();
const siteController = require('../../controllers/admin/siteContent');

// Fixed: functions are explicitly passed
router.get('/', siteController.getSiteContent);
router.post('/footer', siteController.updateFooter);
router.post('/gender-status', siteController.updateGenderStatus);
router.post('/gender-category', siteController.updateGenderCategory);

module.exports = router;
