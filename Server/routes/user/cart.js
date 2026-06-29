const express = require("express");
const router = express.Router();
const cart = require("../../controllers/user/cart");
const userAuth = require("../../middlewares/userAuth");

router.get("/user/cart_items", userAuth, cart.cart_items);

module.exports = router;