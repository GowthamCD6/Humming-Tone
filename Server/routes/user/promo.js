const express = require("express");
const router = express.Router();
const promo = require("../../controllers/user/promo");

router.patch("/user/use_promo_code/:promo_id", promo.use_promo_code);
router.post("/user/validate_promo", promo.validate_promo);
router.post("/api/user/validate_promo", promo.validate_promo);

module.exports = router;
