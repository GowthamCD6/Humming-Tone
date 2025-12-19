const express = require("express");
const router = express.Router();
const createError = require("http-errors");
const userAuth = require("../../middlewares/userAuth");
const product = require("../../controllers/admin/product");

router.post("/admin/add_product",product.add_product);