const express = require('express');
const router = express.Router();
const adminUsersController = require('../../controllers/admin/adminUsers');
const adminAuth = require('../../middlewares/adminAuth');

// All these routes are admin-protected
router.get('/admin/users', adminAuth, adminUsersController.getAdminUsers);
router.post('/admin/users', adminAuth, adminUsersController.createAdminUser);
router.delete('/admin/users/:id', adminAuth, adminUsersController.deleteAdminUser);
router.put('/admin/change-password', adminAuth, adminUsersController.changePassword);

module.exports = router;
