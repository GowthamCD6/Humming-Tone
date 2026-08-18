const express = require("express");
const router = express.Router();
const whatsappController = require("../../controllers/admin/whatsapp");
const adminAuth = require("../../middlewares/adminAuth");

router.post("/whatsapp/send-order-notification", adminAuth, whatsappController.sendOrderWhatsAppNotification);
router.get("/whatsapp/config-status", adminAuth, whatsappController.getWhatsAppConfigStatus);

module.exports = router;
