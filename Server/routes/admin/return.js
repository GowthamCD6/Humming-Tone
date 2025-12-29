const express = require("express");
const router = express.Router();
const returns = require("../../controllers/admin/return");

router.get("/admin/get_return_requests",returns.get_return_requests);
router.patch("/admin/change_status",returns.change_status);

module.exports = router;