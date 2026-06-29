const express = require("express")
const router = express.Router();
const product = require("../../controllers/user/product");
const adminProduct = require("../../controllers/admin/product");

router.get("/user/fetch_products",product.fetch_products);
router.get("/user/fetch_variants/:id", adminProduct.fetch_variants);
router.get("/user/fetch_new_arrivals",product.fetch_new_arrivals);
router.get("/user/fetch_featured_products",product.fetch_featured_products);
router.post("/user/fetch_recommendations",product.fetch_recommendations);
router.get("/user/fetch_categories",product.fetch_categories);

module.exports = router;