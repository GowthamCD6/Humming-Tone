const express = require("express");
const router = express.Router();
const customize = require("../../controllers/user/customize");
const upload = require("../../middlewares/upload");

router.post("/user/customize_order", upload.single("design_img"), customize.customize_order);

module.exports = router;