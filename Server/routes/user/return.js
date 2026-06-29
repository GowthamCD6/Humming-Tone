const express = require("express");
const router = express.Router();
const returns = require("../../controllers/user/return")
const userAuth = require("../../middlewares/userAuth");

router.post("/user/return_request", userAuth, returns.return_request);
router.get("/user/get_return_request_status/:id", userAuth, returns.get_return_request_status);

module.exports = router;