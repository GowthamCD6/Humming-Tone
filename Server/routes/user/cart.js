const express = require("express");
const router = express.Router();
const cart = require("../../controllers/user/cart");

router.get("/user/cart_items",cart.cart_items);

module.exports = router;