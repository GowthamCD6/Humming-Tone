const express = require("express")
const router = express.Router();
const product = require("../../controllers/user/product");

router.get("/user/fetch_products",product.fetch_products);
router.get("/user/fetch_new_arrivals",product.fetch_new_arrivals);
router.get("/user/fetch_featured_products",product.fetch_featured_products);

module.exports = router;