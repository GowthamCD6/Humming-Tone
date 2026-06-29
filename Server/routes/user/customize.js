const express = require("express");
const router = express.Router();
const customize = require("../../controllers/user/customize");
const upload = require("../../middlewares/upload");
const userAuth = require("../../middlewares/userAuth");

router.post("/user/customize_order", userAuth, upload.single("design_img"), customize.customize_order);

module.exports = router;