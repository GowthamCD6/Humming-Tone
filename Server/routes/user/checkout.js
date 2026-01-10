const express = require('express')
const router = express.Router();
const checkout = require('../../controllers/user/checkout')

router.post("/user/create_order",checkout.create_order);

module.exports = router 

