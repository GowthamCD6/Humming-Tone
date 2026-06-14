const express = require("express");
const router = express.Router();
const authController = require("../../controllers/admin/auth");
const adminAuth = require("../../middlewares/adminAuth");

router.post("/admin/auth/login", authController.adminLogin);

// Add verify endpoint to check JWT validity
router.get("/admin/auth/verify", adminAuth, (req, res) => {
  res.status(200).json({ valid: true, user: req.adminUser });
});

module.exports = router;