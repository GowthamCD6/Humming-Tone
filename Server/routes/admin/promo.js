const express = require("express");
const router = express.Router();
const promo = require("../../controllers/admin/promo");

router.post("/admin/add_promo_code",promo.add_promo_code);
router.patch("/admin/remove_promo_code",promo.remove_promo_code);

module.exports = router;