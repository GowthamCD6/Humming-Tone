const express = require("express");
const router = express.Router();
const promo = require("../../controllers/admin/promo");

router.post("/admin/add_promo_code",promo.add_promo_code);
router.patch("/admin/remove_promo_code/:promo_id",promo.remove_promo_code);
router.patch("/admin/update_promo_code/:promo_id",promo.update_promo);
router.get("/admin/fetch_promos", promo.fetch_promos);
module.exports = router;