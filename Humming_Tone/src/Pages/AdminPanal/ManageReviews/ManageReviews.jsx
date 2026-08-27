import React, { useState, useEffect } from "react";
import { Star, Search, Trash2, CheckCircle, XCircle, AlertCircle, RefreshCw, MessageSquare } from "lucide-react";
import { API_BASE_URL as BASE_URL, getImageUrl } from "../../../utils/apiConfig";
import "./ManageReviews.css";

const getAuthHeaders = () => {
  const token = localStorage.getItem("adminToken");
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
};

export default function ManageReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchReviews = async (page = 1) => {
    setLoading(true);
    try {
      let url = `${BASE_URL}/admin/reviews?page=${page}&limit=${pagination.limit}`;
      if (statusFilter !== "all") {
        url += `&status=${statusFilter}`;
      }
      if (searchQuery.trim() !== "") {
        url += `&search=${encodeURIComponent(searchQuery.trim())}`;
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews(1);
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchReviews(1);
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
      }
    } catch (err) {
      console.error("Error updating review status:", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteReview = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this review?")) {
      return;
    }

    setActionLoadingId(id);
    try {
      const res = await fetch(`${BASE_URL}/admin/reviews/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (res.ok) {
        setReviews((prev) => prev.filter((r) => r.id !== id));
        setPagination((prev) => ({ ...prev, total: Math.max(0, prev.total - 1) }));
      }
    } catch (err) {
      console.error("Error deleting review:", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="admin-stars-row">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star
            key={s}
            size={14}
            fill={s <= rating ? "#f59e0b" : "none"}
            stroke={s <= rating ? "#f59e0b" : "#d1d5db"}
          />
        ))}
        <span className="admin-star-num">({rating}/5)</span>
      </div>
    );
  };

  return (
    <div className="manage-reviews-container">
      <div className="manage-reviews-header">
        <div>
          <h2 className="admin-page-title">Manage Product Reviews</h2>
          <p className="admin-page-subtitle">
            Review, moderate, approve, or remove customer feedback submitted on your store.
          </p>
        </div>

        <button
          className="admin-refresh-btn"
          onClick={() => fetchReviews(pagination.page)}
          disabled={loading}
        >
          <RefreshCw size={16} className={loading ? "spin" : ""} />
          <span>Refresh</span>
        </button>
      </div>

      {/* FILTER AND SEARCH BAR */}
      <div className="reviews-admin-toolbar">
        <form onSubmit={handleSearchSubmit} className="reviews-search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search by customer, email, comment, or product..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="search-submit-btn">Search</button>
        </form>

        <div className="reviews-status-filter-pills">
          {["all", "approved", "pending", "rejected"].map((st) => (
            <button
              key={st}
              className={`status-pill ${statusFilter === st ? "active" : ""}`}
              onClick={() => setStatusFilter(st)}
            >
              {st.charAt(0).toUpperCase() + st.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* REVIEWS TABLE / LIST */}
      <div className="admin-reviews-table-wrapper">
        {loading ? (
          <div className="admin-reviews-loading">
            <RefreshCw size={28} className="spin" />
            <p>Loading reviews...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="admin-reviews-empty">
            <MessageSquare size={48} strokeWidth={1.5} />
            <h3>No Reviews Found</h3>
            <p>No customer reviews match the selected filter criteria.</p>
          </div>
        ) : (
          <table className="admin-reviews-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Customer</th>
                <th>Rating</th>
                <th>Feedback</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((rev) => (
                <tr key={rev.id}>
                  <td className="product-col">
                    <div className="admin-prod-cell">
                      {rev.product_image && (
                        <img
                          src={getImageUrl(rev.product_image)}
                          alt={rev.product_name}
                          className="admin-prod-thumb"
                        />
                      )}
                      <div>
                        <strong>{rev.product_name || `Product #${rev.product_id}`}</strong>
                        <span className="prod-id-tag">ID: {rev.product_id}</span>
                      </div>
                    </div>
                  </td>

                  <td className="customer-col">
                    <strong>{rev.reviewer_name}</strong>
                    <span className="customer-email">{rev.reviewer_email}</span>
                  </td>

                  <td className="rating-col">
                    {renderStars(rev.rating)}
                  </td>

                  <td className="comment-col">
                    {rev.title && <div className="admin-rev-title">{rev.title}</div>}
                    <div className="admin-rev-comment">{rev.comment}</div>
                  </td>

                  <td className="date-col">
                    {new Date(rev.created_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>

                  <td className="status-col">
                    <span className={`status-badge status-${rev.status}`}>
                      {rev.status}
                    </span>
                  </td>

                  <td className="actions-col">
                    <div className="action-buttons-group">
                      {rev.status !== "approved" && (
                        <button
                          className="btn-action-approve"
                          title="Approve Review"
                          onClick={() => handleUpdateStatus(rev.id, "approved")}
                          disabled={actionLoadingId === rev.id}
                        >
                          <CheckCircle size={16} />
                        </button>
                      )}

                      {rev.status !== "rejected" && (
                        <button
                          className="btn-action-reject"
                          title="Reject / Hide Review"
                          onClick={() => handleUpdateStatus(rev.id, "rejected")}
                          disabled={actionLoadingId === rev.id}
                        >
                          <XCircle size={16} />
                        </button>
                      )}

                      <button
                        className="btn-action-delete"
                        title="Delete Review"
                        onClick={() => handleDeleteReview(rev.id)}
                        disabled={actionLoadingId === rev.id}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* PAGINATION */}
      {pagination.totalPages > 1 && (
        <div className="admin-pagination">
          <button
            disabled={pagination.page <= 1}
            onClick={() => fetchReviews(pagination.page - 1)}
          >
            Previous
          </button>
          <span>
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
          </span>
          <button
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => fetchReviews(pagination.page + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
