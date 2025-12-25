const express = require("express");
const router = express.Router();
const promo = require("../../controllers/user/promo");

router.patch("/user/use_promo_code/:promo_id",promo.use_promo_code);
module.exports= router;