import React, { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import SearchIcon from "@mui/icons-material/Search";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import InventoryIcon from "@mui/icons-material/Inventory";
import AirportShuttleIcon from "@mui/icons-material/AirportShuttle";
import HomeIcon from "@mui/icons-material/Home";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import HistoryIcon from "@mui/icons-material/History";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import UserFooter from "../../../components/User-Footer-Card/UserFooter";
import { API_BASE_URL } from "../../../utils/apiConfig";
import "./OrderTracking.css";

const TRACKING_STEPS = [
  { key: "confirmed", label: "Order Confirmed", icon: <CheckCircleIcon /> },
  { key: "packed", label: "Packed", icon: <InventoryIcon /> },
  { key: "shipped", label: "Shipped", icon: <LocalShippingIcon /> },
  { key: "out_for_delivery", label: "Out for Delivery", icon: <AirportShuttleIcon /> },
  { key: "delivered", label: "Delivered", icon: <HomeIcon /> },
];

const STATUS_ORDER = ["pending", "confirmed", "packed", "shipped", "out_for_delivery", "delivered"];

function getStepIndex(status) {
  const idx = STATUS_ORDER.indexOf(status);
  // pending = -1 (nothing completed), confirmed = 0, packed = 1, etc.
  return idx <= 0 ? (status === "confirmed" ? 0 : -1) : idx - 1;
}

function formatDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

const OrderTracking = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [orderNumber, setOrderNumber] = useState(() => localStorage.getItem("ot_order_number") || "");
  const [contactValue, setContactValue] = useState(() => localStorage.getItem("ot_contact_value") || "");
  const [contactType, setContactType] = useState(() => localStorage.getItem("ot_contact_type") || "email");
  const [order, setOrder] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("ot_last_order") || "null");
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [myOrders, setMyOrders] = useState([]);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Return / Exchange modal state
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnReason, setReturnReason] = useState("Size & Fit Issue");
  const [returnType, setReturnType] = useState("Return");
  const [returnDescription, setReturnDescription] = useState("");
  const [returnItemId, setReturnItemId] = useState("");
  const [returnSubmitting, setReturnSubmitting] = useState(false);
  const [returnSuccessMsg, setReturnSuccessMsg] = useState("");
  const [returnErrorMsg, setReturnErrorMsg] = useState("");

  const customerUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("customerUser")) || null;
    } catch {
      return null;
    }
  })();

  // Fetch full account order history directly from DB if customer is signed in
  useEffect(() => {
    const fetchAccountOrders = async () => {
      if (!customerUser?.email && !customerUser?.id) return;
      setLoadingHistory(true);
      try {
        const res = await fetch(`${API_BASE_URL}/user/my_orders`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: customerUser.email,
            user_id: customerUser.id || undefined,
          }),
        });
        const data = await res.json();
        if (res.ok && data.success && Array.isArray(data.orders)) {
          setCustomerOrders(data.orders);
          // If user hasn't tracked an order yet and has history, auto-select the latest order
          if (!order && data.orders.length > 0 && !location.state?.order_number && !localStorage.getItem("ot_order_number")) {
            setOrder(data.orders[0]);
            setOrderNumber(data.orders[0].order_number);
          }
        }
      } catch (err) {
        console.error("Failed to load customer order history:", err);
      } finally {
        setLoadingHistory(false);
      }
    };

    fetchAccountOrders();
  }, [customerUser?.email, customerUser?.id]);

  // Load saved orders from localStorage
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("my_orders")) || [];
    setMyOrders(saved);
  }, []);

  const handleTrackOrder = useCallback(async (orderNum, email, phone) => {
    const oNum = orderNum || orderNumber;
    const eml = email || (contactType === "email" ? contactValue : "");
    const phn = phone || (contactType === "phone" ? contactValue : "");

    if (!oNum.trim()) {
      setError("Please enter your Order ID");
      return;
    }
    if (!eml.trim() && !phn.trim()) {
      setError("Please enter your Email or Phone number");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE_URL}/user/track_order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_number: oNum.trim(),
          email: eml.trim() || undefined,
          phone: phn.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || "Order not found. Please check your details.");
        setOrder(null);
        localStorage.removeItem("ot_last_order");
        return;
      }

      // Persist tracking query credentials for reload persistence
      localStorage.setItem("ot_order_number", oNum.trim());
      localStorage.setItem("ot_contact_value", (eml || phn).trim());
      localStorage.setItem("ot_contact_type", eml.trim() ? "email" : "phone");
      localStorage.setItem("ot_last_order", JSON.stringify(data.order));

      setOrder(data.order);
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [orderNumber, contactType, contactValue]);

  // Auto-track on mount if navigated with state OR if saved tracking credentials exist
  useEffect(() => {
    if (location.state?.order_number) {
      const { order_number, customer_email, customer_phone } = location.state;
      setOrderNumber(order_number);
      const contactVal = customer_email || customer_phone || "";
      const contactTyp = customer_email ? "email" : "phone";
      setContactType(contactTyp);
      setContactValue(contactVal);
      handleTrackOrder(order_number, customer_email, customer_phone);
    } else {
      const savedOrderNo = localStorage.getItem("ot_order_number");
      const savedContactVal = localStorage.getItem("ot_contact_value");
      const savedContactType = localStorage.getItem("ot_contact_type") || "email";

      if (savedOrderNo && savedContactVal) {
        handleTrackOrder(
          savedOrderNo,
          savedContactType === "email" ? savedContactVal : "",
          savedContactType === "phone" ? savedContactVal : ""
        );
      }
    }
  }, [location.state, handleTrackOrder]);

  const handleQuickTrack = (savedOrder) => {
    setOrderNumber(savedOrder.order_number);
    if (savedOrder.customer_email) {
      setContactType("email");
      setContactValue(savedOrder.customer_email);
      handleTrackOrder(savedOrder.order_number, savedOrder.customer_email, "");
    } else if (savedOrder.customer_phone) {
      setContactType("phone");
      setContactValue(savedOrder.customer_phone);
      handleTrackOrder(savedOrder.order_number, "", savedOrder.customer_phone);
    }
  };

  const handleRemoveSavedOrder = (orderNum) => {
    const updated = myOrders.filter((o) => o.order_number !== orderNum);
    setMyOrders(updated);
    localStorage.setItem("my_orders", JSON.stringify(updated));
  };

  const activeStep = order ? getStepIndex(order.order_status) : -1;
  const isCancelled = order?.order_status === "cancelled";

  return (
    <>
      <div className="ot-page">
        {/* Header */}
        <header className="ot-header">
          <div className="ot-header-icon">
            <LocalShippingIcon style={{ fontSize: "2.5rem" }} />
          </div>
          <h1 className="ot-title">Track Your Order</h1>
          <p className="ot-subtitle">
            Enter your Order ID and Email or Phone number to track your shipment
          </p>
        </header>

        {/* Search Form */}
        <section className="ot-search-card">
          {customerUser && (
            <div className="ot-user-account-banner" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px 20px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#0f172a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                  {(customerUser.name || 'U')[0].toUpperCase()}
                </div>
                <div>
                  <strong style={{ display: 'block', color: '#0f172a', fontSize: '0.98rem' }}>{customerUser.name}</strong>
                  <span style={{ color: '#64748b', fontSize: '0.84rem' }}>{customerUser.email} · {customerOrders.length} Order{customerOrders.length === 1 ? '' : 's'} placed</span>
                </div>
              </div>
              <span style={{ background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', fontSize: '0.78rem', fontWeight: 600, padding: '4px 12px', borderRadius: '20px' }}>
                ✓ Google Account Connected
              </span>
            </div>
          )}

          {/* Logged in orders history list */}
          {customerOrders.length > 0 && (
            <div className="ot-account-orders-section" style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#0f172a', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <HistoryIcon style={{ fontSize: '1.2rem', color: '#475569' }} />
                <span>Your Order History</span>
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
                {customerOrders.map((ord) => {
                  const isSelected = order?.order_number === ord.order_number;
                  return (
                    <div
                      key={ord.order_number}
                      onClick={() => {
                        setOrder(ord);
                        setOrderNumber(ord.order_number);
                        if (ord.customer_email) setContactValue(ord.customer_email);
                        setError("");
                      }}
                      style={{
                        padding: '14px 16px',
                        borderRadius: '8px',
                        border: isSelected ? '2px solid #0f172a' : '1px solid #e2e8f0',
                        background: isSelected ? '#f8fafc' : '#ffffff',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <strong style={{ fontSize: '0.9rem', color: '#0f172a' }}>{ord.order_number}</strong>
                        <span style={{
                          fontSize: '0.74rem',
                          textTransform: 'uppercase',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '4px',
                          background: ord.order_status === 'delivered' ? '#ecfdf5' : ord.order_status === 'cancelled' ? '#fef2f2' : '#fef3c7',
                          color: ord.order_status === 'delivered' ? '#059669' : ord.order_status === 'cancelled' ? '#dc2626' : '#d97706'
                        }}>
                          {ord.order_status?.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        {/* Search / Lookup Form */}
        <section className="ot-form-card">
          <form onSubmit={handleTrack} className="ot-form">
            <div className="ot-input-group">
              <label htmlFor="orderNumber">Order Reference Number</label>
              <div className="ot-input-wrapper">
                <input
                  id="orderNumber"
                  type="text"
                  placeholder="e.g. ORD-2026-XXXX or #1024"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                />
              </div>
            </div>

            <div className="ot-input-group">
              <div className="ot-label-row">
                <label htmlFor="contactValue">
                  {contactType === "email" ? "Registered Email Address" : "Registered Phone Number"}
                </label>
                <div className="ot-toggle-type">
                  <button
                    type="button"
                    className={`ot-toggle-btn ${contactType === "email" ? "active" : ""}`}
                    onClick={() => {
                      setContactType("email");
                      setContactValue("");
                    }}
                  >
                    Email
                  </button>
                  <button
                    type="button"
                    className={`ot-toggle-btn ${contactType === "phone" ? "active" : ""}`}
                    onClick={() => {
                      setContactType("phone");
                      setContactValue("");
                    }}
                  >
                    Phone
                  </button>
                </div>
              </div>

              <div className="ot-input-wrapper">
                <input
                  id="contactValue"
                  type={contactType === "email" ? "email" : "tel"}
                  placeholder={contactType === "email" ? "e.g. patron@hummingtone.com" : "e.g. 9876543210"}
                  value={contactValue}
                  onChange={(e) => setContactValue(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="ot-submit-btn" disabled={loading}>
              <SearchIcon />
              {loading ? "Locating Order..." : "Track Order"}
            </button>
          </form>

          {error && <div className="ot-error-msg">{error}</div>}
        </section>

        {/* Customer Order History */}
        {customerOrders.length > 0 && (
          <section className="ot-history-card">
            <div className="ot-history-header">
              <div className="ot-history-title-wrap">
                <HistoryIcon />
                <h3>Your Recent Orders</h3>
              </div>
            </div>

            <div className="ot-history-list">
              {customerOrders.map((histOrder) => (
                <div
                  key={histOrder.id || histOrder.order_number}
                  className={`ot-history-item ${order?.order_number === histOrder.order_number ? "active" : ""}`}
                  onClick={() => {
                    setOrder(histOrder);
                    setOrderNumber(histOrder.order_number);
                  }}
                >
                  <div className="ot-hist-info">
                    <strong>#{histOrder.order_number}</strong>
                    <span>{formatDate(histOrder.created_at)}</span>
                  </div>
                  <div className="ot-hist-meta">
                    <span className={`ot-status-badge ot-status-${histOrder.order_status}`}>
                      {histOrder.order_status?.replace(/_/g, " ")}
                    </span>
                    <ArrowForwardIcon sx={{ fontSize: 16 }} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Saved Orders */}
        {!order && myOrders.length > 0 && (
          <section className="ot-saved-section">
            <div className="ot-saved-header">
              <HistoryIcon />
              <h2>Your Recent Orders</h2>
            </div>
            <div className="ot-saved-list">
              {myOrders.map((savedOrder) => (
                <div key={savedOrder.order_number} className="ot-saved-card">
                  <div className="ot-saved-info">
                    <span className="ot-saved-orderno">{savedOrder.order_number}</span>
                    <span className="ot-saved-date">
                      {formatDate(savedOrder.created_at) || "Recent order"}
                    </span>
                  </div>
                  <div className="ot-saved-actions">
                    <button
                      className="ot-saved-track-btn"
                      onClick={() => handleQuickTrack(savedOrder)}
                    >
                      Track <ArrowForwardIcon fontSize="small" />
                    </button>
                    <button
                      className="ot-saved-remove-btn"
                      onClick={() => handleRemoveSavedOrder(savedOrder.order_number)}
                      title="Remove from history"
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Tracking Result */}
        {order && (
          <section className="ot-result">
            {/* Order Info Card */}
            <div className="ot-order-card">
              <div className="ot-order-card-header">
                <h2>Order #{order.order_number}</h2>
                {isCancelled ? (
                  <span className="ot-status-badge ot-status-cancelled">Cancelled</span>
                ) : (
                  <span className={`ot-status-badge ot-status-${order.order_status}`}>
                    {order.order_status?.replace(/_/g, " ")}
                  </span>
                )}
              </div>

              <div className="ot-order-meta">
                <div className="ot-meta-item">
                  <span className="ot-meta-label">Customer</span>
                  <span className="ot-meta-value">{order.customer_name}</span>
                </div>
                <div className="ot-meta-item">
                  <span className="ot-meta-label">Order Date</span>
                  <span className="ot-meta-value">{formatDate(order.created_at) || "—"}</span>
                </div>
                <div className="ot-meta-item">
                  <span className="ot-meta-label">Shipping Date</span>
                  <span className="ot-meta-value">
                    {formatDate(order.shipping_date) || "Will be updated soon"}
                  </span>
                </div>
                <div className="ot-meta-item">
                  <span className="ot-meta-label">Expected Delivery</span>
                  <span className="ot-meta-value ot-meta-highlight">
                    {formatDate(order.delivery_date) || "Will be updated soon"}
                  </span>
                </div>
                <div className="ot-meta-item">
                  <span className="ot-meta-label">Total Amount</span>
                  <span className="ot-meta-value">₹{parseFloat(order.total_amount).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Timeline Stepper */}
            {!isCancelled && (
              <div className="ot-timeline-card">
                <h3 className="ot-timeline-title">Tracking Timeline</h3>
                <div className="ot-timeline">
                  {TRACKING_STEPS.map((step, idx) => {
                    const isCompleted = idx <= activeStep;
                    const isCurrent = idx === activeStep;
                    return (
                      <div
                        key={step.key}
                        className={`ot-step ${isCompleted ? "ot-step-completed" : ""} ${isCurrent ? "ot-step-current" : ""}`}
                      >
                        <div className="ot-step-connector">
                          {idx > 0 && (
                            <div className={`ot-step-line ${isCompleted ? "ot-line-completed" : ""}`} />
                          )}
                        </div>
                        <div className={`ot-step-circle ${isCompleted ? "ot-circle-completed" : ""} ${isCurrent ? "ot-circle-current" : ""}`}>
                          {isCompleted ? (
                            <CheckCircleIcon className="ot-step-check" />
                          ) : (
                            <RadioButtonUncheckedIcon className="ot-step-unchecked" />
                          )}
                        </div>
                        <div className="ot-step-content">
                          <div className="ot-step-icon">{step.icon}</div>
                          <div className="ot-step-info">
                            <span className={`ot-step-label ${isCompleted ? "ot-label-completed" : ""}`}>
                              {step.label}
                            </span>
                            {isCompleted && (
                              <span className="ot-step-check-text">✔</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Cancelled Notice */}
            {isCancelled && (
              <div className="ot-cancelled-card">
                <h3>Order Cancelled</h3>
                <p>This order has been cancelled. If you have questions, please contact our support team.</p>
              </div>
            )}

            {/* Order Items */}
            {order.items && order.items.length > 0 && (
              <div className="ot-items-card">
                <h3 className="ot-items-title">Order Items ({order.items.length})</h3>
                <div className="ot-items-list">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="ot-item">
                      <div className="ot-item-details">
                        <span className="ot-item-name">{item.product_name}</span>
                        <span className="ot-item-meta">
                          {item.size && `Size: ${item.size}`}
                          {item.color && ` · Color: ${item.color}`}
                          {` · Qty: ${item.quantity}`}
                        </span>
                      </div>
                      <span className="ot-item-price">
                        ₹{(parseFloat(item.product_price) * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Return / Exchange Service Banner for Delivered Orders */}
            {order.order_status === "delivered" && (
              <div className="ot-return-banner">
                <div className="ot-return-content">
                  <h4>Need a Return or Exchange?</h4>
                  <p>Enjoy our complimentary 7-day doorstep reverse pickup for unworn garments with intact tags.</p>
                </div>
                <button
                  className="ot-return-btn"
                  onClick={() => setShowReturnModal(true)}
                >
                  Request Return / Exchange
                </button>
              </div>
            )}

            {/* Back button */}
            <div className="ot-result-actions">
              <button
                className="ot-back-btn"
                onClick={() => {
                  localStorage.removeItem("ot_order_number");
                  localStorage.removeItem("ot_contact_value");
                  localStorage.removeItem("ot_contact_type");
                  localStorage.removeItem("ot_last_order");
                  setOrderNumber("");
                  setContactValue("");
                  setOrder(null);
                  setError("");
                }}
              >
                ← Track Another Order
              </button>
              <button className="ot-home-btn" onClick={() => navigate("/usertab/home")}>
                Continue Shopping
              </button>
            </div>
          </section>
        )}
      </div>

      {/* Return Request Modal */}
      {showReturnModal && order && (
        <div className="ot-modal-overlay" onClick={() => setShowReturnModal(false)}>
          <div className="ot-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="ot-modal-header">
              <div>
                <h3>Request Return / Exchange</h3>
                <p>Order #{order.order_number}</p>
              </div>
              <button className="ot-modal-close" onClick={() => setShowReturnModal(false)}>
                ✕
              </button>
            </div>

            <form onSubmit={handleReturnSubmit} className="ot-modal-body">
              {returnSuccessMsg && (
                <div className="ot-modal-success">{returnSuccessMsg}</div>
              )}
              {returnErrorMsg && (
                <div className="ot-modal-error">{returnErrorMsg}</div>
              )}

              <div className="ot-modal-group">
                <label>Service Type</label>
                <div className="ot-type-toggle">
                  <button
                    type="button"
                    className={`ot-type-btn ${returnType === "Return" ? "active" : ""}`}
                    onClick={() => setReturnType("Return")}
                  >
                    Refund Return
                  </button>
                  <button
                    type="button"
                    className={`ot-type-btn ${returnType === "Exchange" ? "active" : ""}`}
                    onClick={() => setReturnType("Exchange")}
                  >
                    Size / Style Exchange
                  </button>
                </div>
              </div>

              {order.items && order.items.length > 1 && (
                <div className="ot-modal-group">
                  <label>Select Item to Return</label>
                  <select
                    value={returnItemId}
                    onChange={(e) => setReturnItemId(e.target.value)}
                    className="ot-modal-select"
                  >
                    <option value="">All Items in Order</option>
                    {order.items.map((it) => (
                      <option key={it.id} value={it.id}>
                        {it.product_name} ({it.size || "Std"}, {it.color || "Std"})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="ot-modal-group">
                <label>Reason for Request *</label>
                <select
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  className="ot-modal-select"
                  required
                >
                  <option value="Size & Fit Issue">Size & Fit Issue</option>
                  <option value="Damaged / Defective Item">Damaged / Defective Item</option>
                  <option value="Received Wrong Piece">Received Wrong Piece</option>
                  <option value="Quality Not as Expected">Quality Not as Expected</option>
                  <option value="Change of Preference">Change of Preference</option>
                </select>
              </div>

              <div className="ot-modal-group">
                <label>Additional Notes / Feedback</label>
                <textarea
                  rows={3}
                  placeholder="Please describe why you would like to return or exchange this piece..."
                  value={returnDescription}
                  onChange={(e) => setReturnDescription(e.target.value)}
                  className="ot-modal-textarea"
                />
              </div>

              <div className="ot-modal-footer">
                <button
                  type="button"
                  className="ot-btn-cancel"
                  onClick={() => setShowReturnModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="ot-btn-submit"
                  disabled={returnSubmitting}
                >
                  {returnSubmitting ? "Submitting..." : "Confirm & Schedule Pickup"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <UserFooter />
    </>
  );
};

export default OrderTracking;
