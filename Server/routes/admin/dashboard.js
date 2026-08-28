const express = require("express");
const router = express.Router();
const adminAuth = require("../../middlewares/adminAuth");
const dashboard = require("../../controllers/admin/dashboard");

router.get("/admin/dashboard/analytics", adminAuth, dashboard.getDashboardAnalytics);

module.exports = router;