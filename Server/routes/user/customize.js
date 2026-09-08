const express = require("express");
const router = express.Router();
const customize = require("../../controllers/user/customize");
const upload = require("../../middlewares/upload");
const userAuth = require("../../middlewares/userAuth");

router.post("/user/customize_order", userAuth, upload.single("design_img"), customize.customize_order);
router.post("/customize/upload-user-design", upload.single("image"), customize.upload_user_design);
router.post("/user/customize/upload-user-design", upload.single("image"), customize.upload_user_design);

module.exports = router;