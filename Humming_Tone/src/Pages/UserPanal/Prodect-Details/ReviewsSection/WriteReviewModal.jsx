import React, { useState } from "react";
import { Star, X, CheckCircle2, AlertCircle } from "lucide-react";
import { API_BASE_URL } from "../../../../utils/apiConfig";
import "./ProductReviews.css";

const WriteReviewModal = ({ isOpen, onClose, productId, productName, onReviewSubmitted }) => {
  const customerUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("customerUser")) || null;
    } catch {
      return null;
    }
  })();

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [name, setName] = useState(customerUser?.name || "");
  const [email, setEmail] = useState(customerUser?.email || "");
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  // Sync user if log in state changes
  React.useEffect(() => {
    if (customerUser) {
      if (!name) setName(customerUser.name || "");
      if (!email) setEmail(customerUser.email || "");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!name.trim()) {
      setErrorMsg("Please enter your name.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }
    if (!comment.trim() || comment.trim().length < 5) {
      setErrorMsg("Please write at least a brief comment (minimum 5 characters).");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/user/products/${productId}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reviewer_name: name.trim(),
          reviewer_email: email.trim(),
          rating: Number(rating),
          title: title.trim(),
          comment: comment.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error?.message || "Failed to submit review");
      }

      setIsSuccess(true);
      if (onReviewSubmitted && data.review) {
        onReviewSubmitted(data.review);
      }

      // Automatically close after a short delay
      setTimeout(() => {
        setIsSuccess(false);
        setName("");
        setEmail("");
        setTitle("");
        setComment("");
        setRating(5);
        onClose();
      }, 1600);
    } catch (err) {
      setErrorMsg(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="review-modal-overlay" onClick={onClose}>
      <div
        className="review-modal-content"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <button className="review-modal-close-btn" onClick={onClose} aria-label="Close modal">
          <X size={20} />
        </button>

        {isSuccess ? (
          <div className="review-success-state">
            <CheckCircle2 className="review-success-icon" size={56} />
            <h3 className="review-success-title">Review Submitted!</h3>
            <p className="review-success-text">
              Thank you for sharing your experience. Your feedback helps others discover the best of Humming Tone.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="review-form">
            <div className="review-modal-header">
              <span className="review-modal-badge">Customer Feedback</span>
              <h2 className="review-modal-title">Write a Review</h2>
              <p className="review-modal-subtitle">
                Share your thoughts on <strong>{productName || "this product"}</strong>
              </p>
            </div>

            {errorMsg && (
              <div className="review-error-banner">
                <AlertCircle size={18} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* STAR RATING PICKER */}
            <div className="review-rating-select-group">
              <label className="review-field-label">Overall Rating *</label>
              <div className="review-stars-picker">
                {[1, 2, 3, 4, 5].map((starVal) => {
                  const activeStars = hoverRating || rating;
                  const isFilled = starVal <= activeStars;
                  return (
                    <button
                      type="button"
                      key={starVal}
                      className={`star-pick-btn ${isFilled ? "filled" : ""}`}
                      onClick={() => setRating(starVal)}
                      onMouseEnter={() => setHoverRating(starVal)}
                      onMouseLeave={() => setHoverRating(0)}
                      aria-label={`${starVal} star${starVal > 1 ? "s" : ""}`}
                    >
                      <Star
                        size={28}
                        className={isFilled ? "star-icon-filled" : "star-icon-empty"}
                        fill={isFilled ? "#1a1a1a" : "none"}
                        stroke={isFilled ? "#1a1a1a" : "#ccc"}
                      />
                    </button>
                  );
                })}
                <span className="rating-feedback-label">
                  {(hoverRating || rating) === 5 && "Excellent (5/5)"}
                  {(hoverRating || rating) === 4 && "Very Good (4/5)"}
                  {(hoverRating || rating) === 3 && "Average (3/5)"}
                  {(hoverRating || rating) === 2 && "Poor (2/5)"}
                  {(hoverRating || rating) === 1 && "Terrible (1/5)"}
                </span>
              </div>
            </div>

            {/* NAME & EMAIL FIELDS */}
            <div className="review-form-row">
              <div className="review-form-field">
                <label className="review-field-label" htmlFor="rev-name">
                  Your Name *
                </label>
                <input
                  id="rev-name"
                  type="text"
                  placeholder="e.g. Ananya Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="review-text-input"
                  required
                />
              </div>

              <div className="review-form-field">
                <label className="review-field-label" htmlFor="rev-email">
                  Your Email *
                </label>
                <input
                  id="rev-email"
                  type="email"
                  placeholder="e.g. ananya@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="review-text-input"
                  required
                />
              </div>
            </div>

            {/* REVIEW HEADLINE */}
            <div className="review-form-field">
              <label className="review-field-label" htmlFor="rev-title">
                Review Headline (Optional)
              </label>
              <input
                id="rev-title"
                type="text"
                placeholder="e.g. Fantastic fit and premium fabric quality!"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="review-text-input"
              />
            </div>

            {/* REVIEW COMMENT */}
            <div className="review-form-field">
              <label className="review-field-label" htmlFor="rev-comment">
                Your Review *
              </label>
              <textarea
                id="rev-comment"
                rows={4}
                placeholder="What did you love about this product? How did the sizing, material, and look feel in person?"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="review-textarea"
                required
              />
            </div>

            <div className="review-modal-actions">
              <button
                type="button"
                className="review-cancel-btn"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="review-submit-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit Review"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default WriteReviewModal;
