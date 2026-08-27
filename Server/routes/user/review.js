const express = require("express");
const router = express.Router();
const reviewController = require("../../controllers/user/review");

router.get("/user/products/:id/reviews", reviewController.getProductReviews);
router.post("/user/products/:id/reviews", reviewController.submitProductReview);

module.exports = router;
