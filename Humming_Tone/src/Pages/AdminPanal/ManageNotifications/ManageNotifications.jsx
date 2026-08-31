import React, { useState, useEffect } from 'react';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import RateReviewIcon from '@mui/icons-material/RateReview';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CampaignIcon from '@mui/icons-material/Campaign';
import SendIcon from '@mui/icons-material/Send';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RefreshIcon from '@mui/icons-material/Refresh';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import StarIcon from '@mui/icons-material/Star';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../../utils/apiConfig';
import './ManageNotifications.css';

export default function ManageNotifications() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('activity'); // 'activity' | 'broadcast'

  // Admin Activity State
  const [activityData, setActivityData] = useState({
    summary: { today_orders_count: 0, pending_reviews_count: 0, low_stock_count: 0 },
    today_orders: [],
    recent_reviews: [],
    low_stock: [],
  });
  const [loadingActivity, setLoadingActivity] = useState(true);

  // Broadcast State
  const [broadcasts, setBroadcasts] = useState([]);
  const [loadingBroadcasts, setLoadingBroadcasts] = useState(false);
  const [sendingBroadcast, setSendingBroadcast] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Form State for New Notification
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'product_drop',
    product_id: '',
    image_url: '',
  });

  useEffect(() => {
    fetchActivityAlerts();
    fetchBroadcasts();
  }, []);

  const fetchActivityAlerts = async () => {
    setLoadingActivity(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_BASE_URL}/admin/activity_alerts`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        setActivityData(data);
      }
    } catch (err) {
      console.error('Failed to fetch activity alerts:', err);
    } finally {
      setLoadingActivity(false);
    }
  };

  const fetchBroadcasts = async () => {
    setLoadingBroadcasts(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_BASE_URL}/admin/all_notifications`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        setBroadcasts(data.notifications || []);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoadingBroadcasts(false);
    }
  };

  const handleCreateBroadcast = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.message.trim()) {
      setErrorMessage('Please fill in both the notification title and message.');
      return;
    }

    setSendingBroadcast(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_BASE_URL}/api/notifications/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          title: formData.title.trim(),
          message: formData.message.trim(),
          type: formData.type,
          product_id: formData.product_id ? Number(formData.product_id) : null,
          image_url: formData.image_url.trim() || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to broadcast notification');

      setSuccessMessage('🎉 Notification successfully broadcasted to all mobile & web users!');
      setFormData({
        title: '',
        message: '',
        type: 'product_drop',
        product_id: '',
        image_url: '',
      });
      fetchBroadcasts();
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to send broadcast');
    } finally {
      setSendingBroadcast(false);
    }
  };

  const handleDeleteNotification = async (id) => {
    if (!window.confirm('Are you sure you want to delete this broadcast notification?')) return;
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_BASE_URL}/api/notifications/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        setBroadcasts((prev) => prev.filter((n) => n.id !== id));
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  return (
    <div className="admin-notif-page">
      {/* 🔹 Header */}
      <div className="notif-header-strip">
        <div>
          <h2 className="notif-page-title">Notification & Activity Center</h2>
          <p className="notif-page-sub">
            Monitor real-time incoming orders & reviews, and broadcast updates to all customer devices.
          </p>
        </div>
        <button
          className="notif-refresh-btn"
          onClick={() => {
            fetchActivityAlerts();
            fetchBroadcasts();
          }}
        >
          <RefreshIcon fontSize="small" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* 🔹 Navigation Tabs */}
      <div className="notif-tabs-bar">
        <button
          className={`notif-tab-btn ${activeTab === 'activity' ? 'active' : ''}`}
          onClick={() => setActiveTab('activity')}
        >
          <NotificationsIcon fontSize="small" />
          <span>Daily Activity & Alerts</span>
          {(activityData.summary?.today_orders_count > 0 || activityData.summary?.pending_reviews_count > 0) && (
            <span className="notif-tab-badge">
              {(activityData.summary?.today_orders_count || 0) + (activityData.summary?.pending_reviews_count || 0)}
            </span>
          )}
        </button>

        <button
          className={`notif-tab-btn ${activeTab === 'broadcast' ? 'active' : ''}`}
          onClick={() => setActiveTab('broadcast')}
        >
          <CampaignIcon fontSize="small" />
          <span>Broadcast to Users</span>
        </button>
      </div>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 🔹 TAB 1: DAILY ACTIVITY & INCOMING ALERTS FOR ADMIN */}
      {/* ────────────────────────────────────────────────────────── */}
      {activeTab === 'activity' && (
        <div className="activity-container">
          {/* Summary Metric Counters */}
          <div className="activity-metrics-grid">
            <div className="metric-card orders-card">
              <div className="metric-ico-wrap">
                <ShoppingCartIcon />
              </div>
              <div className="metric-details">
                <span className="metric-val">{activityData.summary?.today_orders_count || 0}</span>
                <span className="metric-lbl">Orders Placed Today</span>
              </div>
            </div>

            <div className="metric-card reviews-card">
              <div className="metric-ico-wrap">
                <RateReviewIcon />
              </div>
              <div className="metric-details">
                <span className="metric-val">{activityData.summary?.pending_reviews_count || 0}</span>
                <span className="metric-lbl">Pending Customer Reviews</span>
              </div>
            </div>

            <div className="metric-card stock-card">
              <div className="metric-ico-wrap">
                <WarningAmberIcon />
              </div>
              <div className="metric-details">
                <span className="metric-val">{activityData.summary?.low_stock_count || 0}</span>
                <span className="metric-lbl">Low Stock Alerts (≤ 5 items)</span>
              </div>
            </div>
          </div>

          <div className="activity-sections-grid">
            {/* Section 1: Today's Orders */}
            <div className="activity-box">
              <div className="activity-box-header">
                <div className="box-header-title">
                  <ShoppingCartIcon fontSize="small" className="box-ico" />
                  <h3>Today's Orders ({activityData.today_orders?.length || 0})</h3>
                </div>
                <button
                  className="box-action-link"
                  onClick={() => navigate('/admin/manage-orders')}
                >
                  <span>Manage All Orders</span>
                  <OpenInNewIcon fontSize="inherit" />
                </button>
              </div>

              <div className="activity-box-body">
                {loadingActivity ? (
                  <p className="loading-text">Loading today's orders...</p>
                ) : activityData.today_orders?.length === 0 ? (
                  <div className="empty-state-box">
                    <CheckCircleIcon style={{ color: '#16a34a', fontSize: 32 }} />
                    <p>No new orders placed in the last 24 hours yet.</p>
                  </div>
                ) : (
                  <div className="activity-list">
                    {activityData.today_orders.map((ord) => (
                      <div key={ord.id} className="activity-item-card">
                        <div className="item-header-row">
                          <span className="order-number-badge">#{ord.order_number}</span>
                          <span className={`status-pill pill-${ord.order_status?.toLowerCase()}`}>
                            {ord.order_status}
                          </span>
                        </div>
                        <div className="item-details-row">
                          <span className="customer-name">{ord.customer_name || 'Patron'}</span>
                          <span className="order-price">₹{Number(ord.total_amount || 0).toLocaleString('en-IN')}</span>
                        </div>
                        <div className="item-footer-row">
                          <span className="time-text">
                            {new Date(ord.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {ord.item_count || 1} items
                          </span>
                          <button
                            className="item-quick-btn"
                            onClick={() => navigate('/admin/manage-orders')}
                          >
                            Inspect Order
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Section 2: Recent Reviews */}
            <div className="activity-box">
              <div className="activity-box-header">
                <div className="box-header-title">
                  <RateReviewIcon fontSize="small" className="box-ico" />
                  <h3>Recent Customer Reviews ({activityData.recent_reviews?.length || 0})</h3>
                </div>
                <button
                  className="box-action-link"
                  onClick={() => navigate('/admin/manage-reviews')}
                >
                  <span>Moderate Reviews</span>
                  <OpenInNewIcon fontSize="inherit" />
                </button>
              </div>

              <div className="activity-box-body">
                {loadingActivity ? (
                  <p className="loading-text">Loading reviews...</p>
                ) : activityData.recent_reviews?.length === 0 ? (
                  <div className="empty-state-box">
                    <CheckCircleIcon style={{ color: '#16a34a', fontSize: 32 }} />
                    <p>No pending customer reviews awaiting moderation.</p>
                  </div>
                ) : (
                  <div className="activity-list">
                    {activityData.recent_reviews.map((rev) => (
                      <div key={rev.id} className="activity-item-card">
                        <div className="item-header-row">
                          <span className="review-prod-title" title={rev.product_name}>
                            {rev.product_name || 'Product Review'}
                          </span>
                          <div className="review-rating-stars">
                            {[...Array(5)].map((_, i) => (
                              <StarIcon
                                key={i}
                                style={{
                                  fontSize: 14,
                                  color: i < rev.rating ? '#eab308' : '#cbd5e1',
                                }}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="review-comment-snippet">"{rev.comment}"</p>
                        <div className="item-footer-row">
                          <span className="reviewer-info">
                            By {rev.reviewer_name} • <span className={`rev-status-tag ${rev.status}`}>{rev.status}</span>
                          </span>
                          <button
                            className="item-quick-btn"
                            onClick={() => navigate('/admin/manage-reviews')}
                          >
                            Review
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 3: Low Stock Alerts */}
          {activityData.low_stock?.length > 0 && (
            <div className="low-stock-alert-bar">
              <div className="alert-bar-left">
                <WarningAmberIcon className="alert-ico" />
                <div>
                  <h4>Low Stock Alert ({activityData.low_stock.length} variants)</h4>
                  <p>The following variants have 5 or fewer items remaining in inventory:</p>
                </div>
              </div>
              <button
                className="inventory-jump-btn"
                onClick={() => navigate('/admin/inventory')}
              >
                Go to Inventory
              </button>
            </div>
          )}
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* 🔹 TAB 2: BROADCAST PUSH NOTIFICATION TO ALL USERS */}
      {/* ────────────────────────────────────────────────────────── */}
      {activeTab === 'broadcast' && (
        <div className="broadcast-container">
          {/* Success / Error Alerts */}
          {successMessage ? <div className="alert-banner success">{successMessage}</div> : null}
          {errorMessage ? <div className="alert-banner error">{errorMessage}</div> : null}

          <div className="broadcast-grid">
            {/* Left: Create Notification Form */}
            <div className="broadcast-form-card">
              <div className="form-card-header">
                <CampaignIcon className="form-ico" />
                <div>
                  <h3>Broadcast New Notification</h3>
                  <p>Send an instant announcement, promo, or new collection alert to all users.</p>
                </div>
              </div>

              <form onSubmit={handleCreateBroadcast} className="broadcast-form">
                <div className="form-group">
                  <label className="form-label">Notification Title *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. 🎉 Exclusive Weekend Atelier Flash Sale"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Notification Message *</label>
                  <textarea
                    className="form-textarea"
                    rows={4}
                    placeholder="e.g. Enjoy 20% off on all bespoke tailoring and limited edition jackets this weekend only. Use code ATELIER20 at checkout."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                  />
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label">Notification Category</label>
                    <select
                      className="form-select"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    >
                      <option value="product_drop">✨ New Arrival / Product Drop</option>
                      <option value="promo">🏷️ Promotional / Discount Code</option>
                      <option value="announcement">📢 Store Announcement</option>
                      <option value="order_update">📦 Order & Milestone Alert</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Target Product ID (Optional)</label>
                    <input
                      type="number"
                      className="form-input"
                      placeholder="e.g. 42"
                      value={formData.product_id}
                      onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Banner Image URL (Optional)</label>
                  <input
                    type="url"
                    className="form-input"
                    placeholder="https://res.cloudinary.com/.../banner.jpg"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  />
                </div>

                <button
                  type="submit"
                  className="submit-broadcast-btn"
                  disabled={sendingBroadcast}
                >
                  <SendIcon fontSize="small" />
                  <span>{sendingBroadcast ? 'Broadcasting...' : 'Publish to All Users'}</span>
                </button>
              </form>
            </div>

            {/* Right: Broadcast History Table */}
            <div className="broadcast-history-card">
              <div className="history-card-header">
                <h3>Broadcasts History ({broadcasts.length})</h3>
                <span className="history-sub">Recent announcements visible on mobile & web</span>
              </div>

              {loadingBroadcasts ? (
                <p className="loading-text">Loading broadcast records...</p>
              ) : broadcasts.length === 0 ? (
                <div className="empty-history-box">
                  <CampaignIcon style={{ fontSize: 40, color: '#94a3b8', marginBottom: 8 }} />
                  <p>No broadcast notifications sent yet.</p>
                </div>
              ) : (
                <div className="broadcast-history-list">
                  {broadcasts.map((notif) => (
                    <div key={notif.id} className="history-item">
                      <div className="history-item-top">
                        <span className={`type-tag tag-${notif.type}`}>
                          {notif.type?.replace('_', ' ').toUpperCase()}
                        </span>
                        <span className="history-date">
                          {new Date(notif.created_at).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                      <h4 className="history-title">{notif.title}</h4>
                      <p className="history-message">{notif.message}</p>
                      {notif.product_name && (
                        <span className="history-linked-product">
                          Linked Piece: #{notif.product_id} - {notif.product_name}
                        </span>
                      )}
                      <div className="history-item-footer">
                        <button
                          className="delete-notif-btn"
                          onClick={() => handleDeleteNotification(notif.id)}
                          title="Delete Notification"
                        >
                          <DeleteOutlineIcon fontSize="small" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
