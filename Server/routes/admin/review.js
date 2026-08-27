const express = require("express");
const router = express.Router();
const reviewController = require("../../controllers/admin/review");

router.get("/admin/reviews", reviewController.getAllReviews);
router.patch("/admin/reviews/:id/status", reviewController.updateReviewStatus);
router.delete("/admin/reviews/:id", reviewController.deleteReview);

module.exports = router;
