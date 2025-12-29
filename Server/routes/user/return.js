const express = require("express");
const router = express.Router();
const returns = require("../../controllers/user/return")

router.post("/user/return_request",returns.return_request);
router.get("/user/get_return_request_status/:id",returns.get_return_request_status);

module.exports = router;