const db = require("../../config/db");
const createError = require("http-errors");

/**
 * Fetch all reviews for admin moderation with optional status/search filters and pagination
 * GET /admin/reviews
 */
exports.getAllReviews = (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 20);
    const offset = (pageNum - 1) * limitNum;

    let whereClauses = [];
    let params = [];

    if (status && ['approved', 'pending', 'rejected'].includes(status)) {
      whereClauses.push("r.status = ?");
      params.push(status);
    }

    if (search && search.trim() !== '') {
      whereClauses.push("(r.reviewer_name LIKE ? OR r.reviewer_email LIKE ? OR r.title LIKE ? OR r.comment LIKE ? OR p.name LIKE ?)");
      const term = `%${search.trim()}%`;
      params.push(term, term, term, term, term);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

    const countSql = `
      SELECT COUNT(*) AS total 
      FROM product_reviews r
      LEFT JOIN products p ON r.product_id = p.id
      ${whereSql}
    `;

    const fetchSql = `
      SELECT 
        r.id,
        r.product_id,
        r.reviewer_name,
        r.reviewer_email,
        r.rating,
        r.title,
        r.comment,
        r.status,
        r.created_at,
        p.name AS product_name,
        p.image_path AS product_image
      FROM product_reviews r
      LEFT JOIN products p ON r.product_id = p.id
      ${whereSql}
      ORDER BY r.created_at DESC
      LIMIT ? OFFSET ?
    `;

    db.query(countSql, params, (countErr, countResult) => {
      if (countErr) return next(countErr);
      const total = countResult[0]?.total || 0;

      db.query(fetchSql, [...params, limitNum, offset], (fetchErr, rows) => {
        if (fetchErr) return next(fetchErr);

        return res.status(200).json({
          reviews: rows || [],
          pagination: {
            total,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(total / limitNum) || 1,
          },
        });
      });
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update review status (approve, reject, pending)
 * PATCH /admin/reviews/:id/status
 */
exports.updateReviewStatus = (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['approved', 'pending', 'rejected'].includes(status)) {
      return next(createError.BadRequest("Invalid status value. Must be approved, pending, or rejected."));
    }

    const updateSql = `UPDATE product_reviews SET status = ? WHERE id = ?`;
    db.query(updateSql, [status, id], (err, result) => {
      if (err) return next(err);
      if (result.affectedRows === 0) {
        return next(createError.NotFound("Review not found"));
      }

      return res.status(200).json({
        message: `Review status updated to ${status}`,
        id,
        status,
      });
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a review permanently
 * DELETE /admin/reviews/:id
 */
exports.deleteReview = (req, res, next) => {
  try {
    const { id } = req.params;

    const deleteSql = `DELETE FROM product_reviews WHERE id = ?`;
    db.query(deleteSql, [id], (err, result) => {
      if (err) return next(err);
      if (result.affectedRows === 0) {
        return next(createError.NotFound("Review not found"));
      }

      return res.status(200).json({
        message: "Review deleted successfully",
        id,
      });
    });
  } catch (error) {
    next(error);
  }
};
