import React, { useState, useEffect, useMemo } from "react";
import { Star, MessageSquarePlus, ThumbsUp, ShieldCheck, Filter, ChevronDown, Check } from "lucide-react";
import { API_BASE_URL } from "../../../../utils/apiConfig";
import WriteReviewModal from "./WriteReviewModal";
import "./ProductReviews.css";

const ProductReviews = ({ productId, productName }) => {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({
    totalReviews: 0,
    averageRating: 0,
    ratingBreakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRatingFilter, setSelectedRatingFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  // Fetch reviews whenever productId changes
  const fetchReviews = async () => {
    if (!productId) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/user/products/${productId}/reviews`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews || []);
        if (data.stats) {
          setStats(data.stats);
        }
      }
    } catch (err) {
      console.error("Failed to load reviews:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const handleReviewSubmitted = (newReview) => {
    // Add new review optimistically to the list and re-calculate stats
    setReviews((prev) => [newReview, ...prev]);
    setStats((prev) => {
      const newTotal = prev.totalReviews + 1;
      const r = Number(newReview.rating);
      const newBreakdown = {
        ...prev.ratingBreakdown,
        [r]: (prev.ratingBreakdown[r] || 0) + 1,
      };
      // calculate new average
      let weightedSum = 0;
      Object.keys(newBreakdown).forEach((star) => {
        weightedSum += Number(star) * newBreakdown[star];
      });
      const newAvg = Math.round((weightedSum / newTotal) * 10) / 10;

      return {
        totalReviews: newTotal,
        averageRating: newAvg,
        ratingBreakdown: newBreakdown,
      };
    });
  };

  // Filtered and sorted reviews
  const displayedReviews = useMemo(() => {
    let list = [...reviews];

    if (selectedRatingFilter !== "all") {
      const star = Number(selectedRatingFilter);
      list = list.filter((item) => Number(item.rating) === star);
    }

    if (sortBy === "newest") {
      list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else if (sortBy === "highest") {
      list.sort((a, b) => Number(b.rating) - Number(a.rating));
    } else if (sortBy === "lowest") {
      list.sort((a, b) => Number(a.rating) - Number(b.rating));
    }

    return list;
  }, [reviews, selectedRatingFilter, sortBy]);

  const renderStars = (ratingCount, size = 16) => {
    const num = Math.round(Number(ratingCount) || 0);
    return (
      <div className="stars-row" aria-label={`${num} out of 5 stars`}>
        {[1, 2, 3, 4, 5].map((s) => (
          <Star
            key={s}
            size={size}
            className={s <= num ? "star-solid" : "star-muted"}
            fill={s <= num ? "#1a1a1a" : "none"}
            stroke={s <= num ? "#1a1a1a" : "#d1d5db"}
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const [selectedReviewModal, setSelectedReviewModal] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const carouselTrackRef = React.useRef(null);

  // Auto-scroll effect moving right to left
  useEffect(() => {
    const track = carouselTrackRef.current;
    if (!track || displayedReviews.length === 0 || isPaused) return;

    let animationFrameId;
    let speed = 0.8; // px per tick

    const step = () => {
      if (track) {
        track.scrollLeft += speed;
        // If reached end, seamlessly loop back to start
        if (track.scrollLeft >= track.scrollWidth - track.clientWidth - 2) {
          track.scrollLeft = 0;
        }
      }
      animationFrameId = requestAnimationFrame(step);
    };

    animationFrameId = requestAnimationFrame(step);

    return () => cancelAnimationFrame(animationFrameId);
  }, [displayedReviews, isPaused]);

  return (
    <section className="product-reviews-section" id="customer-reviews">
      <div className="reviews-section-header">
        <div>
          <span className="reviews-eyebrow">Customer Ratings</span>
          <h2 className="reviews-main-title">Reviews & Feedback</h2>
        </div>

        <button
          className="write-review-trigger-btn"
          onClick={() => setIsModalOpen(true)}
        >
          <MessageSquarePlus size={18} />
          <span>Write a Review</span>
        </button>
      </div>

      <div className="reviews-divider"></div>

      {/* OVERALL RATING & BREAKDOWN BANNER */}
      <div className="reviews-summary-card">
        <div className="reviews-score-block">
          <div className="reviews-big-score">
            {stats.totalReviews > 0 ? stats.averageRating.toFixed(1) : "0.0"}
          </div>
          <div className="reviews-stars-score">
            {renderStars(stats.averageRating, 20)}
          </div>
          <div className="reviews-count-caption">
            Based on <strong>{stats.totalReviews}</strong> {stats.totalReviews === 1 ? "review" : "verified reviews"}
          </div>
        </div>

        <div className="reviews-breakdown-bars">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = stats.ratingBreakdown[star] || 0;
            const percentage = stats.totalReviews > 0 ? Math.round((count / stats.totalReviews) * 100) : 0;
            const isFilterActive = selectedRatingFilter === String(star);

            return (
              <div
                key={star}
                className={`breakdown-row ${isFilterActive ? "active-filter" : ""}`}
                onClick={() =>
                  setSelectedRatingFilter(isFilterActive ? "all" : String(star))
                }
                role="button"
                tabIndex={0}
              >
                <div className="breakdown-star-label">
                  <span>{star}</span>
                  <Star size={13} fill="#1a1a1a" stroke="#1a1a1a" />
                </div>
                <div className="breakdown-track">
                  <div
                    className="breakdown-fill"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <div className="breakdown-percentage">
                  <span>{count}</span>
                  <small>({percentage}%)</small>
                </div>
              </div>
            );
          })}
        </div>

        <div className="reviews-guarantee-badge">
          <ShieldCheck size={28} className="shield-icon" />
          <div className="guarantee-text">
            <h4>100% Authentic Customer Reviews</h4>
            <p>Every review is submitted directly by buyers of Humming Tone products.</p>
          </div>
        </div>
      </div>

      {/* REVIEWS FILTERING AND SORTING BAR */}
      <div className="reviews-controls-bar">
        <div className="reviews-filter-tags">
          <button
            className={`filter-pill ${selectedRatingFilter === "all" ? "active" : ""}`}
            onClick={() => setSelectedRatingFilter("all")}
          >
            All Ratings ({stats.totalReviews})
          </button>
          {[5, 4, 3, 2, 1].map((star) => {
            const count = stats.ratingBreakdown[star] || 0;
            if (count === 0 && stats.totalReviews > 0) return null;
            return (
              <button
                key={star}
                className={`filter-pill ${selectedRatingFilter === String(star) ? "active" : ""}`}
                onClick={() => setSelectedRatingFilter(String(star))}
              >
                {star} ★ ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* REVIEWS LIST / ANIMATED SLIDER CARDS */}
      <div className="reviews-list-container">
        {isLoading ? (
          <div className="reviews-loading-state">
            <div className="reviews-skeleton-card"></div>
            <div className="reviews-skeleton-card"></div>
          </div>
        ) : displayedReviews.length === 0 ? (
          <div className="reviews-empty-box">
            <div className="empty-icon-wrap">
              <MessageSquarePlus size={36} strokeWidth={1.5} />
            </div>
            {selectedRatingFilter !== "all" ? (
              <>
                <h3 className="empty-title">No {selectedRatingFilter}-star reviews yet</h3>
                <p className="empty-desc">
                  There are no reviews matching this specific star rating.
                </p>
                <button
                  className="reset-filter-btn"
                  onClick={() => setSelectedRatingFilter("all")}
                >
                  View All Reviews
                </button>
              </>
            ) : (
              <>
                <h3 className="empty-title">No reviews yet for this product</h3>
                <p className="empty-desc">
                  Be the very first customer to review <strong>{productName}</strong> and share your styling impressions with others.
                </p>
                <button
                  className="write-first-review-btn"
                  onClick={() => setIsModalOpen(true)}
                >
                  Write the First Review
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="reviews-slider-wrapper">
            {/* If 1, 2 or 3 reviews, provide a smooth carousel loop with repeated items to fill screen width */}
            <div
              className={`reviews-carousel-track ${isPaused ? "paused" : ""}`}
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              onTouchStart={() => setIsPaused(true)}
              onTouchEnd={() => setIsPaused(false)}
            >
              {/* Group 1: Repeated as needed to exceed full width smoothly */}
              <div className="reviews-ticker-group">
                {(() => {
                  let repeated = [...displayedReviews];
                  while (repeated.length < 5) {
                    repeated = [...repeated, ...displayedReviews];
                  }
                  return repeated.map((rev, idx) => (
                    <div
                      key={`g1-${rev.id || idx}-${idx}`}
                      className="review-sliding-card"
                      onClick={() => setSelectedReviewModal(rev)}
                      title="Click to view detailed review"
                    >
                      <div className="sliding-card-header">
                        <div className="reviewer-avatar">
                          {getInitials(rev.reviewer_name)}
                        </div>
                        <div className="reviewer-meta">
                          <div className="reviewer-name-row">
                            <span className="reviewer-name">{rev.reviewer_name}</span>
                            <span className="verified-badge">
                              <Check size={11} strokeWidth={3} /> Verified
                            </span>
                          </div>
                          <span className="review-date">{formatDate(rev.created_at)}</span>
                        </div>
                      </div>

                      <div className="sliding-card-stars">
                        {renderStars(rev.rating, 14)}
                      </div>

                      {rev.title && <h4 className="sliding-card-title">{rev.title}</h4>}

                      <p className="sliding-card-snippet">
                        {rev.comment}
                      </p>

                      <div className="sliding-card-footer">
                        <span className="read-more-hint">Read full feedback →</span>
                      </div>
                    </div>
                  ));
                })()}
              </div>

              {/* Group 2 (Exact duplicate for 100% infinite seamless continuous loop) */}
              <div className="reviews-ticker-group" aria-hidden="true">
                {(() => {
                  let repeated = [...displayedReviews];
                  while (repeated.length < 5) {
                    repeated = [...repeated, ...displayedReviews];
                  }
                  return repeated.map((rev, idx) => (
                    <div
                      key={`g2-${rev.id || idx}-${idx}`}
                      className="review-sliding-card"
                      onClick={() => setSelectedReviewModal(rev)}
                      title="Click to view detailed review"
                    >
                      <div className="sliding-card-header">
                        <div className="reviewer-avatar">
                          {getInitials(rev.reviewer_name)}
                        </div>
                        <div className="reviewer-meta">
                          <div className="reviewer-name-row">
                            <span className="reviewer-name">{rev.reviewer_name}</span>
                            <span className="verified-badge">
                              <Check size={11} strokeWidth={3} /> Verified
                            </span>
                          </div>
                          <span className="review-date">{formatDate(rev.created_at)}</span>
                        </div>
                      </div>

                      <div className="sliding-card-stars">
                        {renderStars(rev.rating, 14)}
                      </div>

                      {rev.title && <h4 className="sliding-card-title">{rev.title}</h4>}

                      <p className="sliding-card-snippet">
                        {rev.comment}
                      </p>

                      <div className="sliding-card-footer">
                        <span className="read-more-hint">Read full feedback →</span>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* DETAILED ELABORATED REVIEW MODAL */}
      {selectedReviewModal && (
        <div className="review-detail-modal-overlay" onClick={() => setSelectedReviewModal(null)}>
          <div className="review-detail-modal-box" onClick={(e) => e.stopPropagation()}>
            <button className="review-detail-modal-close" onClick={() => setSelectedReviewModal(null)}>
              ✕
            </button>

            <div className="detail-modal-header">
              <div className="reviewer-avatar detail-avatar">
                {getInitials(selectedReviewModal.reviewer_name)}
              </div>
              <div>
                <div className="detail-name-row">
                  <h3 className="detail-reviewer-name">{selectedReviewModal.reviewer_name}</h3>
                  <span className="verified-badge">
                    <Check size={12} strokeWidth={3} /> Verified Buyer
                  </span>
                </div>
                <span className="detail-date">{formatDate(selectedReviewModal.created_at)}</span>
              </div>
            </div>

            <div className="detail-stars-row">
              {renderStars(selectedReviewModal.rating, 20)}
              <span className="detail-rating-num">{selectedReviewModal.rating} out of 5 stars</span>
            </div>

            {selectedReviewModal.title && (
              <h4 className="detail-review-title">{selectedReviewModal.title}</h4>
            )}

            <div className="detail-review-body">
              <p>{selectedReviewModal.comment}</p>
            </div>

            <div className="detail-modal-footer">
              <div className="detail-product-tag">
                Reviewed for: <strong>{productName}</strong>
              </div>
              <button className="detail-close-action-btn" onClick={() => setSelectedReviewModal(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WRITE REVIEW MODAL */}
      <WriteReviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        productId={productId}
        productName={productName}
        onReviewSubmitted={handleReviewSubmitted}
      />
    </section>
  );
};

export default ProductReviews;
