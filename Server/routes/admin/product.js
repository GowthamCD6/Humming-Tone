const express = require("express");
const router = express.Router();
const createError = require("http-errors");
const userAuth = require("../../middlewares/userAuth");
const upload = require("../../middlewares/upload");
const product = require("../../controllers/admin/product");

router.post("/admin/add_product", upload.array("images", 5), product.add_product); // max 5 images
router.get("/admin/fetch_products",product.fetch_products);
router.get("/admin/fetch_variants/:id",product.fetch_variants);
router.patch("/admin/update_product/:id",product.update_product);
router.patch("/admin/update_variant/:id",product.update_variant);
router.delete("/admin/delete_product",product.delete_product);


module.exports = router;




