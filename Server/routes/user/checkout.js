const express = require('express')
const router = express.Router();
const checkout = require('../../controllers/user/checkout')

router.post('/user/checkout', checkout.checkoutOrders);


module.exports = router 

