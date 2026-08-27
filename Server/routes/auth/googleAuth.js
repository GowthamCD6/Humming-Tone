const express = require("express");
const router = express.Router();
const googleAuthController = require("../../controllers/auth/googleAuth");

router.post("/api/auth/google/user", googleAuthController.googleUserAuth);
router.post("/api/auth/google/admin", googleAuthController.googleAdminAuth);

module.exports = router;
