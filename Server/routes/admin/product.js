const express = require("express");
const router = express.Router();
const createError = require("http-errors");
const userAuth = require("../../middlewares/userAuth");
const upload = require("../../middlewares/upload");
const product = require("../../controllers/admin/product");

router.post("/admin/add_product", upload.array("images", 5), product.add_product); // max 5 images