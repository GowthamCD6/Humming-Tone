const express = require("express")
const router = express.Router();
const product = require("../../controllers/user/product");

router.get("/user/fetch_products",product.fetch_products);

module.exports = router;