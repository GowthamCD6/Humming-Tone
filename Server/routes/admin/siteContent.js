const express = require("express");
const router = express.Router();
const siteController = require("../../controllers/admin/siteContent");

router.get("/admin/site-content", siteController.get_site_content);
router.post("/admin/site-content", siteController.update_site_content);

module.exports = router;

