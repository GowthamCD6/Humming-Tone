import React, { useState, useEffect } from "react";
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

  // Load saved orders from localStorage
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("my_orders")) || [];
    setMyOrders(saved);
  }, []);

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
  }, []);

  const handleTrackOrder = async (orderNum, email, phone) => {
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
      const res = await fetch("http://localhost:5000/user/track_order", {
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
  };

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
          <div className="ot-search-form">
            <div className="ot-input-group">
              <label className="ot-label">Order ID</label>
              <input
                type="text"
                className="ot-input"
                placeholder="e.g. ORD-1720512345678"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
              />
            </div>

            <div className="ot-input-group">
              <label className="ot-label">Verify With</label>
              <div className="ot-contact-row">
                <div className="ot-toggle-group">
                  <button
                    className={`ot-toggle-btn ${contactType === "email" ? "ot-toggle-active" : ""}`}
                    onClick={() => setContactType("email")}
                  >
                    Email
                  </button>
                  <button
                    className={`ot-toggle-btn ${contactType === "phone" ? "ot-toggle-active" : ""}`}
                    onClick={() => setContactType("phone")}
                  >
                    Phone
                  </button>
                </div>
                <input
                  type={contactType === "email" ? "email" : "tel"}
                  className="ot-input ot-contact-input"
                  placeholder={contactType === "email" ? "your@email.com" : "9876543210"}
                  value={contactValue}
                  onChange={(e) => setContactValue(e.target.value)}
                />
              </div>
            </div>

            <button
              className="ot-track-btn"
              onClick={() => handleTrackOrder()}
              disabled={loading}
            >
              {loading ? (
                <span className="ot-btn-loading">Tracking...</span>
              ) : (
                <>
                  <SearchIcon /> Track Order
                </>
              )}
            </button>
          </div>

          {error && <div className="ot-error">{error}</div>}
        </section>

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

      <UserFooter />
    </>
  );
};

export default OrderTracking;
