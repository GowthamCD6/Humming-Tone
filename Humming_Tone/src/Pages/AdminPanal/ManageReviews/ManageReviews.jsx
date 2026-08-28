import React, { useState, useEffect, useMemo } from "react";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import SearchIcon from "@mui/icons-material/Search";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import RefreshIcon from "@mui/icons-material/Refresh";
import RateReviewIcon from "@mui/icons-material/RateReview";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HourglassBottomIcon from "@mui/icons-material/HourglassBottom";
import CancelIcon from "@mui/icons-material/Cancel";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import RotateLeftIcon from "@mui/icons-material/RotateLeft";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CloseIcon from "@mui/icons-material/Close";
import PersonIcon from "@mui/icons-material/Person";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import { API_BASE_URL as BASE_URL, getImageUrl } from "../../../utils/apiConfig";
import "./ManageReviews.css";

const STATUS_CHIPS = [
  { key: "all", label: "All Reviews", color: "#64748b" },
  { key: "approved", label: "Approved", color: "#10b981" },
  { key: "pending", label: "Pending", color: "#f59e0b" },
  { key: "rejected", label: "Rejected", color: "#ef4444" },
];

const getAuthHeaders = () => {
  const token = localStorage.getItem("adminToken");
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
};

// Toast notification component
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className={`mr-toast mr-toast-${type}`}>
      <span className="mr-toast-text">{message}</span>
      <button className="mr-toast-close" onClick={onClose}>
        <CloseIcon fontSize="small" />
      </button>
    </div>
  );
}

export default function ManageReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [selectedReviews, setSelectedReviews] = useState(new Set());
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [selectedReviewDetail, setSelectedReviewDetail] = useState(null);

  // Overall counts for stat cards
  const [summaryCounts, setSummaryCounts] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
  });

  // Toasts
  const [toasts, setToasts] = useState([]);
  const addToast = (message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  };
  const removeToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  // Fetch summary counts for the stat cards
  const fetchSummaryCounts = async () => {
    try {
      const res = await fetch(`${BASE_URL}/admin/reviews?limit=1000`, { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        const all = data.reviews || [];
        setSummaryCounts({
          total: all.length,
          approved: all.filter((r) => r.status === "approved").length,
          pending: all.filter((r) => r.status === "pending").length,
          rejected: all.filter((r) => r.status === "rejected").length,
        });
      }
    } catch (err) {
      console.error("Failed to fetch summary counts:", err);
    }
  };

  const fetchReviews = async (page = 1) => {
    setLoading(true);
    try {
      let url = `${BASE_URL}/admin/reviews?page=${page}&limit=${pagination.limit}`;
      if (statusFilter !== "all") {
        url += `&status=${statusFilter}`;
      }
      if (appliedSearch.trim() !== "") {
        url += `&search=${encodeURIComponent(appliedSearch.trim())}`;
      }

      const res = await fetch(url, { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews || []);
        if (data.pagination) {
          setPagination(data.pagination);
        }
      }
    } catch (err) {
      console.error("Failed to fetch admin reviews:", err);
      addToast("Failed to load reviews", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummaryCounts();
  }, []);

  useEffect(() => {
    fetchReviews(pagination.page);
  }, [statusFilter, appliedSearch, pagination.limit]);

  // Client-side rating filter on current page
  const filteredReviews = useMemo(() => {
    if (ratingFilter === "all") return reviews;
    return reviews.filter((r) => Number(r.rating) === Number(ratingFilter));
  }, [reviews, ratingFilter]);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    setAppliedSearch(searchQuery);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setAppliedSearch("");
    setStatusFilter("all");
    setRatingFilter("all");
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleUpdateStatus = async (id, newStatus) => {
    setActionLoadingId(id);
    try {
      const res = await fetch(`${BASE_URL}/admin/reviews/${id}/status`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setReviews((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
        );
        if (selectedReviewDetail && selectedReviewDetail.id === id) {
          setSelectedReviewDetail((prev) => ({ ...prev, status: newStatus }));
        }
        fetchSummaryCounts();
        addToast(`Review marked as ${newStatus}`, "success");
      } else {
        addToast("Status update failed", "error");
      }
    } catch (err) {
      console.error("Error updating review status:", err);
      addToast("Error updating status", "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteReview = async (id) => {
    setDeleteConfirmId(null);
    setActionLoadingId(id);
    try {
      const res = await fetch(`${BASE_URL}/admin/reviews/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (res.ok) {
        setReviews((prev) => prev.filter((r) => r.id !== id));
        if (selectedReviewDetail && selectedReviewDetail.id === id) {
          setSelectedReviewDetail(null);
        }
        setPagination((prev) => ({ ...prev, total: Math.max(0, prev.total - 1) }));
        setSelectedReviews((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        fetchSummaryCounts();
        addToast("Review deleted successfully", "success");
      } else {
        addToast("Failed to delete review", "error");
      }
    } catch (err) {
      console.error("Error deleting review:", err);
      addToast("Error deleting review", "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Bulk actions
  const handleSelectReview = (id) => {
    setSelectedReviews((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedReviews.size === filteredReviews.length) {
      setSelectedReviews(new Set());
    } else {
      setSelectedReviews(new Set(filteredReviews.map((r) => r.id)));
    }
  };

  const isAllSelected = filteredReviews.length > 0 && selectedReviews.size === filteredReviews.length;

  const handleBulkStatus = async (status) => {
    if (selectedReviews.size === 0) return;
    const ids = Array.from(selectedReviews);
    try {
      await Promise.all(
        ids.map((id) =>
          fetch(`${BASE_URL}/admin/reviews/${id}/status`, {
            method: "PATCH",
            headers: getAuthHeaders(),
            body: JSON.stringify({ status }),
          })
        )
      );
      setReviews((prev) =>
        prev.map((r) => (selectedReviews.has(r.id) ? { ...r, status } : r))
      );
      setSelectedReviews(new Set());
      fetchSummaryCounts();
      addToast(`${ids.length} review(s) marked as ${status}`, "success");
    } catch (err) {
      console.error("Bulk status error:", err);
      addToast("Failed to update selected reviews", "error");
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Permanently delete ${selectedReviews.size} selected reviews?`)) return;
    const ids = Array.from(selectedReviews);
    try {
      await Promise.all(
        ids.map((id) =>
          fetch(`${BASE_URL}/admin/reviews/${id}`, {
            method: "DELETE",
            headers: getAuthHeaders(),
          })
        )
      );
      setReviews((prev) => prev.filter((r) => !selectedReviews.has(r.id)));
      setSelectedReviews(new Set());
      fetchSummaryCounts();
      addToast(`${ids.length} review(s) deleted`, "success");
    } catch (err) {
      console.error("Bulk delete error:", err);
      addToast("Failed to delete selected reviews", "error");
    }
  };

  const renderStars = (rating) => {
    const num = Number(rating) || 5;
    return (
      <div className="mr-stars-row">
        {[1, 2, 3, 4, 5].map((s) =>
          s <= num ? (
            <StarIcon key={s} fontSize="inherit" className="mr-star-gold" />
          ) : (
            <StarBorderIcon key={s} fontSize="inherit" className="mr-star-gray" />
          )
        )}
        <span className="mr-star-val">{num}.0</span>
      </div>
    );
  };

  return (
    <section className="manage-reviews-container">

      {/* Toasts */}
      <div className="mr-toast-container">
        {toasts.map((t) => (
          <Toast key={t.id} message={t.message} type={t.type} onClose={() => removeToast(t.id)} />
        ))}
      </div>

      {/* ===== STAT CARDS GRID (EXACT MANAGE ORDER THEME) ===== */}
      <div className="inv-stats-grid mr-stats-grid">
        <div className="inv-stat-card mr-stat-card">
          <div className="inv-stat-header">
            <div className="inv-stat-label-wrap">
              <span className="mr-stat-icon mr-stat-icon-blue">
                <RateReviewIcon fontSize="inherit" />
              </span>
              <div className="inv-stat-label">TOTAL REVIEWS</div>
            </div>
          </div>
          <div className="inv-stat-value mr-stat-value-blue">{summaryCounts.total}</div>
          <div className="mr-stat-note">All customer ratings submitted</div>
        </div>

        <div className="inv-stat-card mr-stat-card">
          <div className="inv-stat-header">
            <div className="inv-stat-label-wrap">
              <span className="mr-stat-icon mr-stat-icon-green">
                <CheckCircleIcon fontSize="inherit" />
              </span>
              <div className="inv-stat-label">APPROVED</div>
            </div>
          </div>
          <div className="inv-stat-value mr-stat-value-green">{summaryCounts.approved}</div>
          <div className="mr-stat-note">Live on store product pages</div>
        </div>

        <div className="inv-stat-card mr-stat-card">
          <div className="inv-stat-header">
            <div className="inv-stat-label-wrap">
              <span className="mr-stat-icon mr-stat-icon-orange">
                <HourglassBottomIcon fontSize="inherit" />
              </span>
              <div className="inv-stat-label">PENDING</div>
            </div>
          </div>
          <div className="inv-stat-value mr-stat-value-orange">{summaryCounts.pending}</div>
          <div className="mr-stat-note">Waiting for moderation action</div>
        </div>

        <div className="inv-stat-card mr-stat-card">
          <div className="inv-stat-header">
            <div className="inv-stat-label-wrap">
              <span className="mr-stat-icon mr-stat-icon-red">
                <CancelIcon fontSize="inherit" />
              </span>
              <div className="inv-stat-label">REJECTED</div>
            </div>
          </div>
          <div className="inv-stat-value mr-stat-value-red">{summaryCounts.rejected}</div>
          <div className="mr-stat-note">Hidden from customer store</div>
        </div>
      </div>

      {/* ===== STATUS CHIPS ===== */}
      <div className="mr-status-chips">
        {STATUS_CHIPS.map((chip) => {
          const count =
            chip.key === "all"
              ? summaryCounts.total
              : summaryCounts[chip.key] || 0;

          return (
            <button
              key={chip.key}
              className={`mr-chip ${statusFilter === chip.key ? "mr-chip-active" : ""}`}
              style={{
                "--chip-color": chip.color,
                "--chip-bg": statusFilter === chip.key ? chip.color : "transparent",
              }}
              onClick={() => {
                setStatusFilter(chip.key);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
            >
              <span className="mr-chip-dot" style={{ background: chip.color }} />
              {chip.label}
              <span className="mr-chip-count">{count}</span>
            </button>
          );
        })}
      </div>

      {/* ===== FILTER PROTOTYPE CARD ===== */}
      <div className="filter-prototype-card">
        <button
          type="button"
          className="filter-prototype-bar"
          onClick={() => setShowFilterPanel((open) => !open)}
        >
          <div className="filter-prototype-left">
            <span className="filter-title-icon">
              <FilterAltIcon fontSize="inherit" />
            </span>
            <div>
              <div className="section-title">Filter & Search Reviews</div>
              <div className="filter-prototype-subtitle">
                {appliedSearch || ratingFilter !== "all"
                  ? "Active filters applied"
                  : "Click to toggle search & rating filters"}
              </div>
            </div>
          </div>
          <div className="filter-meta">
            <SearchIcon fontSize="inherit" />
            <span>{pagination.total} total reviews</span>
          </div>
        </button>

        {showFilterPanel && (
          <div className="filter-panel">
            <form onSubmit={handleSearchSubmit} className="filter-panel-row">
              <div className="input-group" style={{ flex: "2 1 300px" }}>
                <label htmlFor="search-input">SEARCH</label>
                <input
                  id="search-input"
                  type="text"
                  className="form-input"
                  placeholder="Search by customer, email, title, or product..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="input-group">
                <label htmlFor="rating-filter">RATING</label>
                <select
                  id="rating-filter"
                  className="form-input"
                  value={ratingFilter}
                  onChange={(e) => setRatingFilter(e.target.value)}
                >
                  <option value="all">All Ratings (1–5 Stars)</option>
                  <option value="5">5 Stars Only</option>
                  <option value="4">4 Stars Only</option>
                  <option value="3">3 Stars Only</option>
                  <option value="2">2 Stars Only</option>
                  <option value="1">1 Star Only</option>
                </select>
              </div>
            </form>

            <div className="filter-actions">
              <div className="filter-actions-left">
                <button type="button" className="btn btn-apply" onClick={handleSearchSubmit}>
                  <SearchIcon fontSize="inherit" />
                  APPLY SEARCH
                </button>
                <button type="button" className="btn btn-clear" onClick={handleClearFilters}>
                  <RotateLeftIcon fontSize="inherit" />
                  RESET FILTERS
                </button>
              </div>
              <div className="filter-actions-right">
                <button
                  type="button"
                  className="btn btn-refresh"
                  onClick={() => fetchReviews(pagination.page)}
                  disabled={loading}
                >
                  <RefreshIcon fontSize="inherit" className={loading ? "spin" : ""} />
                  REFRESH
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ===== TABLE CONTAINER ===== */}
      <div className="table-container">
        <div className="orders-table-wrapper">
          <table className="orders-table mr-reviews-table">
            <thead>
              <tr>
                <th className="mr-checkbox-th">
                  <input
                    type="checkbox"
                    className="mr-checkbox"
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                    aria-label="Select all reviews"
                  />
                </th>
                <th>PRODUCT</th>
                <th>CUSTOMER</th>
                <th>RATING</th>
                <th>FEEDBACK & COMMENT</th>
                <th>DATE</th>
                <th>STATUS</th>
                <th style={{ textAlign: "right", paddingRight: "20px" }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, index) => (
                  <tr key={`skel-${index}`} className="mr-skeleton-row">
                    <td className="mr-checkbox-td">
                      <div className="mr-skeleton-cell" style={{ width: "18px", height: "18px", borderRadius: "4px" }} />
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                        <div className="mr-skeleton-cell" style={{ width: "40px", height: "40px", borderRadius: "6px" }} />
                        <div className="mr-skeleton-cell" style={{ width: "120px", height: "14px" }} />
                      </div>
                    </td>
                    <td>
                      <div className="mr-skeleton-cell" style={{ width: "100px", height: "14px", marginBottom: "4px" }} />
                      <div className="mr-skeleton-cell" style={{ width: "130px", height: "10px" }} />
                    </td>
                    <td><div className="mr-skeleton-cell" style={{ width: "90px", height: "16px" }} /></td>
                    <td><div className="mr-skeleton-cell" style={{ width: "180px", height: "14px" }} /></td>
                    <td><div className="mr-skeleton-cell" style={{ width: "80px", height: "14px" }} /></td>
                    <td><div className="mr-skeleton-cell" style={{ width: "80px", height: "24px", borderRadius: "12px" }} /></td>
                    <td><div className="mr-skeleton-cell" style={{ width: "90px", height: "30px", borderRadius: "6px", marginLeft: "auto" }} /></td>
                  </tr>
                ))
              ) : filteredReviews.length === 0 ? (
                <tr>
                  <td colSpan="8">
                    <div className="no-orders">No customer reviews found matching criteria.</div>
                  </td>
                </tr>
              ) : (
                filteredReviews.map((rev) => (
                  <tr key={rev.id} className={selectedReviews.has(rev.id) ? "mr-row-selected" : ""}>
                    <td className="mr-checkbox-td">
                      <input
                        type="checkbox"
                        className="mr-checkbox"
                        checked={selectedReviews.has(rev.id)}
                        onChange={() => handleSelectReview(rev.id)}
                        aria-label={`Select review ${rev.id}`}
                      />
                    </td>

                    {/* Product */}
                    <td className="mr-product-cell" onClick={() => setSelectedReviewDetail(rev)} style={{ cursor: "pointer" }}>
                      <div className="mr-prod-wrap">
                        {rev.product_image && (
                          <img
                            src={getImageUrl(rev.product_image)}
                            alt={rev.product_name}
                            className="mr-prod-thumb"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src =
                                'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="%23cbd5e1" stroke-width="1.5"><rect width="18" height="18" x="3" y="3" rx="2"/></svg>';
                            }}
                          />
                        )}
                        <div className="mr-prod-meta">
                          <span className="mr-prod-name" title={rev.product_name}>
                            {rev.product_name || `Product #${rev.product_id}`}
                          </span>
                          <span className="mr-prod-id">ID: {rev.product_id}</span>
                        </div>
                      </div>
                    </td>

                    {/* Customer */}
                    <td className="customer-info" onClick={() => setSelectedReviewDetail(rev)} style={{ cursor: "pointer" }}>
                      <div className="cust-name">{rev.reviewer_name || "Anonymous Customer"}</div>
                      <div className="cust-email">{rev.reviewer_email}</div>
                    </td>

                    {/* Rating */}
                    <td onClick={() => setSelectedReviewDetail(rev)} style={{ cursor: "pointer" }}>
                      {renderStars(rev.rating)}
                    </td>

                    {/* Feedback */}
                    <td className="mr-comment-cell" onClick={() => setSelectedReviewDetail(rev)} style={{ cursor: "pointer" }}>
                      {rev.title && <div className="mr-comment-title">{rev.title}</div>}
                      <div className="mr-comment-text">{rev.comment || "—"}</div>
                    </td>

                    {/* Date */}
                    <td className="date-info">
                      <div className="date-main">
                        {new Date(rev.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                    </td>

                    {/* Status */}
                    <td>
                      <span className={`status-badge ${rev.status?.toLowerCase()}`}>
                        {rev.status}
                      </span>
                    </td>

                    {/* Action */}
                    <td style={{ textAlign: "right", paddingRight: "20px" }}>
                      <button
                        type="button"
                        className="view-order-btn"
                        onClick={() => setSelectedReviewDetail(rev)}
                        title="View Full Review Details"
                      >
                        <VisibilityIcon /> View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer & Pagination */}
        <div className="table-footer">
          <div className="footer-text">
            Showing {filteredReviews.length} of {pagination.total} total reviews
          </div>

          <div className="pagination-group">
            <label className="limit-label" htmlFor="review-limit-select">
              Rows
            </label>
            <select
              id="review-limit-select"
              className="limit-select"
              value={pagination.limit}
              onChange={(e) =>
                setPagination((prev) => ({
                  ...prev,
                  limit: Number(e.target.value),
                  page: 1,
                }))
              }
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>

            <button
              className="page-btn"
              onClick={() =>
                setPagination((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))
              }
              disabled={pagination.page <= 1}
            >
              Previous
            </button>
            <span className="page-indicator">
              Page {pagination.page} / {pagination.totalPages}
            </span>
            <button
              className="page-btn"
              onClick={() =>
                setPagination((prev) => ({
                  ...prev,
                  page: Math.min(prev.totalPages, prev.page + 1),
                }))
              }
              disabled={pagination.page >= pagination.totalPages}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* ===== FULL REVIEW DETAILS MODAL ===== */}
      {selectedReviewDetail && (
        <div className="mr-detail-modal-overlay" onClick={() => setSelectedReviewDetail(null)}>
          <div className="mr-detail-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="mr-detail-modal-header">
              <div className="mr-detail-header-left">
                <RateReviewIcon className="mr-detail-header-icon" />
                <div>
                  <h3 className="mr-detail-modal-title">Review Details</h3>
                  <span className="mr-detail-modal-subtitle">Review #{selectedReviewDetail.id}</span>
                </div>
              </div>
              <button
                className="mr-detail-modal-close"
                onClick={() => setSelectedReviewDetail(null)}
                aria-label="Close"
              >
                <CloseIcon fontSize="small" />
              </button>
            </div>

            <div className="mr-detail-modal-body">
              {/* Product Info Block */}
              <div className="mr-detail-product-box">
                {selectedReviewDetail.product_image && (
                  <img
                    src={getImageUrl(selectedReviewDetail.product_image)}
                    alt={selectedReviewDetail.product_name}
                    className="mr-detail-prod-img"
                  />
                )}
                <div className="mr-detail-prod-info">
                  <div className="mr-detail-prod-name">{selectedReviewDetail.product_name || `Product #${selectedReviewDetail.product_id}`}</div>
                  <span className="mr-detail-prod-id">Product ID: {selectedReviewDetail.product_id}</span>
                </div>
                <span className={`status-badge ${selectedReviewDetail.status?.toLowerCase()}`}>
                  {selectedReviewDetail.status}
                </span>
              </div>

              {/* Customer & Date Info */}
              <div className="mr-detail-meta-grid">
                <div className="mr-detail-meta-item">
                  <span className="mr-detail-meta-label">Customer Name</span>
                  <div className="mr-detail-meta-val">
                    <PersonIcon fontSize="inherit" style={{ verticalAlign: "middle", marginRight: "4px" }} />
                    {selectedReviewDetail.reviewer_name || "Anonymous Customer"}
                  </div>
                </div>
                <div className="mr-detail-meta-item">
                  <span className="mr-detail-meta-label">Customer Email</span>
                  <div className="mr-detail-meta-val">{selectedReviewDetail.reviewer_email || "No email provided"}</div>
                </div>
                <div className="mr-detail-meta-item">
                  <span className="mr-detail-meta-label">Submitted On</span>
                  <div className="mr-detail-meta-val">
                    <CalendarTodayIcon fontSize="inherit" style={{ verticalAlign: "middle", marginRight: "4px" }} />
                    {new Date(selectedReviewDetail.created_at).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
                <div className="mr-detail-meta-item">
                  <span className="mr-detail-meta-label">Customer Rating</span>
                  <div className="mr-detail-meta-val">
                    {renderStars(selectedReviewDetail.rating)}
                  </div>
                </div>
              </div>

              {/* Full Review Comment */}
              <div className="mr-detail-comment-box">
                {selectedReviewDetail.title && (
                  <h4 className="mr-detail-comment-title">{selectedReviewDetail.title}</h4>
                )}
                <p className="mr-detail-comment-full">
                  {selectedReviewDetail.comment || "No detailed feedback comment provided."}
                </p>
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="mr-detail-modal-footer">
              <div className="mr-detail-actions-left">
                {selectedReviewDetail.status !== "approved" && (
                  <button
                    type="button"
                    className="btn btn-action-approve"
                    onClick={() => handleUpdateStatus(selectedReviewDetail.id, "approved")}
                    disabled={actionLoadingId === selectedReviewDetail.id}
                  >
                    <CheckCircleOutlineIcon fontSize="small" />
                    Approve Review
                  </button>
                )}
                {selectedReviewDetail.status !== "rejected" && (
                  <button
                    type="button"
                    className="btn btn-action-reject"
                    onClick={() => handleUpdateStatus(selectedReviewDetail.id, "rejected")}
                    disabled={actionLoadingId === selectedReviewDetail.id}
                  >
                    <HighlightOffIcon fontSize="small" />
                    Reject / Hide
                  </button>
                )}
                <button
                  type="button"
                  className="btn btn-action-delete"
                  onClick={() => {
                    setDeleteConfirmId(selectedReviewDetail.id);
                  }}
                  disabled={actionLoadingId === selectedReviewDetail.id}
                >
                  <DeleteOutlineIcon fontSize="small" />
                  Delete
                </button>
              </div>
              <button
                type="button"
                className="btn btn-clear"
                onClick={() => setSelectedReviewDetail(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== BULK ACTION BAR (EXACT MANAGE ORDER THEME) ===== */}
      {selectedReviews.size > 0 && (
        <div className="mo-bulk-bar">
          <div className="mo-bulk-left">
            <span className="mo-bulk-count">{selectedReviews.size} review(s) selected</span>
            <button className="mo-bulk-clear" onClick={() => setSelectedReviews(new Set())}>
              Clear
            </button>
          </div>
          <div className="mo-bulk-actions">
            <button
              className="mo-bulk-btn"
              style={{ background: "#10b981", color: "#fff" }}
              onClick={() => handleBulkStatus("approved")}
            >
              <CheckCircleOutlineIcon fontSize="small" />
              Approve Selected
            </button>
            <button
              className="mo-bulk-btn"
              style={{ background: "#f59e0b", color: "#fff" }}
              onClick={() => handleBulkStatus("rejected")}
            >
              <HighlightOffIcon fontSize="small" />
              Reject Selected
            </button>
            <button
              className="mo-bulk-btn"
              style={{ background: "#ef4444", color: "#fff" }}
              onClick={handleBulkDelete}
            >
              <DeleteOutlineIcon fontSize="small" />
              Delete Selected
            </button>
          </div>
        </div>
      )}

      {/* ===== DELETE CONFIRMATION MODAL ===== */}
      {deleteConfirmId && (
        <div className="mo-modal-overlay" onClick={() => setDeleteConfirmId(null)}>
          <div className="mo-modal" onClick={(e) => e.stopPropagation()}>
            <div className="mo-modal-header">
              <h3 className="mo-modal-title">Delete Review</h3>
              <button
                className="mo-modal-close"
                onClick={() => setDeleteConfirmId(null)}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div className="mo-modal-body">
              <p>Are you sure you want to permanently remove this customer review? This action cannot be undone.</p>
            </div>
            <div className="mo-modal-footer">
              <button className="btn btn-clear" onClick={() => setDeleteConfirmId(null)}>
                Cancel
              </button>
              <button
                className="btn"
                style={{ background: "#ef4444", color: "#fff" }}
                onClick={() => handleDeleteReview(deleteConfirmId)}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
