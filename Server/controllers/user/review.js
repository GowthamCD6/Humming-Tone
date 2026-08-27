const db = require("../../config/db");
const createError = require("http-errors");

/**
 * Fetch approved reviews for a specific product along with rating aggregation stats
 * GET /user/products/:id/reviews
 */
exports.getProductReviews = (req, res, next) => {
  try {
    const { id } = req.params;
    const productId = parseInt(id, 10);

    if (!productId || isNaN(productId)) {
      return next(createError.BadRequest("Invalid product ID"));
    }

    // 1. Fetch individual reviews
    const reviewsSql = `
      SELECT 
        id, 
        product_id, 
        reviewer_name, 
        rating, 
        title, 
        comment, 
        created_at 
      FROM product_reviews 
      WHERE product_id = ? AND status = 'approved'
      ORDER BY created_at DESC
    `;

    // 2. Fetch rating statistics (average rating, count, breakdown)
    const statsSql = `
      SELECT 
        COUNT(*) AS total_reviews,
        COALESCE(AVG(rating), 0) AS average_rating,
        SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) AS star_5,
        SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) AS star_4,
        SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) AS star_3,
        SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) AS star_2,
        SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) AS star_1
      FROM product_reviews
      WHERE product_id = ? AND status = 'approved'
    `;

    db.query(reviewsSql, [productId], (err, reviews) => {
      if (err) return next(err);

      db.query(statsSql, [productId], (statsErr, statsResult) => {
        if (statsErr) return next(statsErr);

        const rawStats = statsResult[0] || {};
        const total = Number(rawStats.total_reviews || 0);
        const avg = Number(rawStats.average_rating || 0);

        const ratingBreakdown = {
          5: Number(rawStats.star_5 || 0),
          4: Number(rawStats.star_4 || 0),
          3: Number(rawStats.star_3 || 0),
          2: Number(rawStats.star_2 || 0),
          1: Number(rawStats.star_1 || 0),
        };

        return res.status(200).json({
          reviews: reviews || [],
          stats: {
            totalReviews: total,
            averageRating: Math.round(avg * 10) / 10,
            ratingBreakdown,
          },
        });
      });
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Submit a new review for a product
 * POST /user/products/:id/reviews
 */
exports.submitProductReview = (req, res, next) => {
  try {
    const { id } = req.params;
    const productId = parseInt(id, 10);
    const { reviewer_name, reviewer_email, rating, title, comment } = req.body;

    if (!productId || isNaN(productId)) {
      return next(createError.BadRequest("Invalid product ID"));
    }

    if (!reviewer_name || reviewer_name.trim().length === 0) {
      return next(createError.BadRequest("Name is required"));
    }

    if (!reviewer_email || !reviewer_email.includes("@")) {
      return next(createError.BadRequest("Valid email address is required"));
    }

    const numRating = parseInt(rating, 10);
    if (!numRating || numRating < 1 || numRating > 5) {
      return next(createError.BadRequest("Rating must be an integer between 1 and 5"));
    }

    if (!comment || comment.trim().length < 5) {
      return next(createError.BadRequest("Review comment must be at least 5 characters long"));
    }

    // Verify product exists and is active
    const checkProductSql = `SELECT id FROM products WHERE id = ? LIMIT 1`;
    db.query(checkProductSql, [productId], (prodErr, prodRows) => {
      if (prodErr) return next(prodErr);
      if (!prodRows || prodRows.length === 0) {
        return next(createError.NotFound("Product not found"));
      }

      const insertSql = `
        INSERT INTO product_reviews 
        (product_id, reviewer_name, reviewer_email, rating, title, comment, status)
        VALUES (?, ?, ?, ?, ?, ?, 'approved')
      `;

      const safeTitle = title && title.trim() ? title.trim() : null;

      db.query(
        insertSql,
        [productId, reviewer_name.trim(), reviewer_email.trim().toLowerCase(), numRating, safeTitle, comment.trim()],
        (insertErr, result) => {
          if (insertErr) return next(insertErr);

          return res.status(201).json({
            message: "Review submitted successfully! Thank you for your feedback.",
            reviewId: result.insertId,
            review: {
              id: result.insertId,
              product_id: productId,
              reviewer_name: reviewer_name.trim(),
              rating: numRating,
              title: safeTitle,
              comment: comment.trim(),
              created_at: new Date().toISOString(),
            },
          });
        }
      );
    });
  } catch (error) {
    next(error);
  }
};
