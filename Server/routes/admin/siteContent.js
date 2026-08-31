const express = require('express');
const router = express.Router();
const siteController = require('../../controllers/admin/siteContent');
const adminAuth = require('../../middlewares/adminAuth');

// Public GET for storefront
router.get('/', siteController.getSiteContent);
router.get('/genders-categories', siteController.getGendersAndCategories);

// Admin protected mutations
router.post('/footer', adminAuth, siteController.updateFooter);
router.post('/gender-status', adminAuth, siteController.updateGenderStatus);
router.post('/gender-category', adminAuth, siteController.updateGenderCategory);

module.exports = router;
