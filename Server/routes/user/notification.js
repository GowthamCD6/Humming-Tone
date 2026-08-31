const express = require('express');
const router = express.Router();
const notificationController = require('../../controllers/user/notification');
const adminAuth = require('../../middlewares/adminAuth');

// User / Mobile App Endpoints
router.get('/user/notifications', notificationController.fetch_notifications);
router.get('/api/notifications', notificationController.fetch_notifications);

router.post('/user/notifications/mark_read', notificationController.mark_as_read);
router.post('/api/notifications/mark_read', notificationController.mark_as_read);

// Admin / Broadcast Endpoint
router.post('/api/notifications/create', adminAuth, notificationController.create_notification);

module.exports = router;
