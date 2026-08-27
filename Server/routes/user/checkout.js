const express = require('express')
const router = express.Router();
const checkout = require('../../controllers/user/checkout')

router.post("/user/create_order",checkout.create_order);
router.post("/payment/webhook",checkout.web_hook);
router.post("/user/get_payment_status",checkout.verify_payment);
router.post("/user/cancel_order",checkout.cancel_order);
router.post("/user/track_order",checkout.track_order);
router.post("/user/my_orders",checkout.fetch_my_orders);

module.exports = router;