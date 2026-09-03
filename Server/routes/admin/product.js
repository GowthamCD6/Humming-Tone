const express = require("express");
const router = express.Router();
const createError = require("http-errors");
const userAuth = require("../../middlewares/userAuth");
const upload = require("../../middlewares/upload");
const product = require("../../controllers/admin/product");

router.post("/admin/add_product", upload.array("images", 5), product.add_product); // max 5 images
router.get("/admin/fetch_products",product.fetch_products);
router.get("/admin/fetch_deleted_products",product.fetch_deleted_products);
router.get("/admin/fetch_variants/:id",product.fetch_variants);
router.patch("/admin/update_product/:id", upload.fields([{ name: "image", maxCount: 1 }, { name: "sub_images", maxCount: 10 }]), product.update_product);
router.delete("/admin/delete_product_image", product.delete_product_image);
router.patch("/admin/update_variant/:id", product.update_variant);
router.delete("/admin/delete_product", product.delete_product);
router.patch("/admin/restore_product/:id", product.restore_product);
router.patch("/admin/toggle_featured/:id", product.toggle_featured);
router.get("/admin/export_products_data", product.getExportProductsData);

module.exports = router;




