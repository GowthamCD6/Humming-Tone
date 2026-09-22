const express = require("express");
const router = express.Router();
const returns = require("../../controllers/user/return");
const { optionalUserAuth } = require("../../middlewares/userAuth");

router.post("/user/return_request", optionalUserAuth, returns.return_request);
router.post("/user/request_return", optionalUserAuth, returns.return_request);
router.get("/user/get_return_request_status/:id", optionalUserAuth, returns.get_return_request_status);

module.exports = router;