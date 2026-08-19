import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useLottie } from "lottie-react";
import truckAnimationData from "../../../animation/Truck Animation.json";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HomeIcon from "@mui/icons-material/Home";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import ShieldCheckIcon from "@mui/icons-material/VerifiedUser";
import { API_BASE_URL } from "../../../utils/apiConfig";
import "./PaymentSuccess.css";

const TruckAnimation = () => {
  const options = {
    animationData: truckAnimationData,
    loop: true,
    autoplay: true,
  };
  const { View } = useLottie(options, { width: "100%", height: "100%" });
  return <div className="ps-truck-lottie-inner">{View}</div>;
};

function formatDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
}

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const order_number = location.state?.order_number;
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (order_number) {
      navigator.clipboard.writeText(order_number);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  useEffect(() => {
    if (!order_number) {
      navigate("/usertab/home");
      return;
    }

    const verifyPayment = async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/user/get_payment_status`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              order_number,
              razorpay_payment_id: location.state?.razorpay_payment_id,
              razorpay_order_id: location.state?.razorpay_order_id,
              razorpay_signature: location.state?.razorpay_signature,
            }),
          }
        );

        const data = await res.json();

        if (data.msg !== "payment verified") {
          navigate("/usertab/payment-failure", {
            state: { order_number },
          });
          return;
        }

        // Save order to localStorage for tracking
        const orderInfo = {
          order_number,
          customer_email: data.order?.customer_email || location.state?.customer_email || "",
          customer_phone: data.order?.customer_phone || location.state?.customer_phone || "",
          created_at: data.order?.created_at || new Date().toISOString(),
        };

        const existingOrders = JSON.parse(localStorage.getItem("my_orders")) || [];
        // Avoid duplicates
        const alreadyExists = existingOrders.some(o => o.order_number === order_number);
        if (!alreadyExists) {
          existingOrders.unshift(orderInfo);
          // Keep only last 20 orders
          if (existingOrders.length > 20) existingOrders.pop();
          localStorage.setItem("my_orders", JSON.stringify(existingOrders));
        }

        setOrderData({
          order_number,
          shipping_date: data.order?.shipping_date || null,
          delivery_date: data.order?.delivery_date || null,
          order_status: data.order?.order_status || "confirmed",
          customer_email: data.order?.customer_email || "",
          customer_phone: data.order?.customer_phone || "",
        });
        setShowModal(true);
      } catch (err) {
        console.error(err);
        navigate("/usertab/payment-failure", {
          state: { order_number },
        });
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [order_number, navigate, location.state]);

  if (loading) {
    return (
      <div className="payment-result">
        <div className="result-header">
          <span className="result-icon">⏳</span>
          <h1>Verifying Payment...</h1>
        </div>
      </div>
    );
  }

  if (!orderData) return null;

  return (
    <div className="ps-page-container">
      <div className="payment-result">
        {/* Animated Badge & Header */}
        <div className="result-header">
          <div className="ps-truck-animation-wrap">
            <TruckAnimation />
          </div>
          <div className="result-title-row">
            <div className="ps-check-icon-bubble">
              <CheckCircleIcon className="result-icon-check" />
            </div>
            <h1>Order Placed Successfully!</h1>
          </div>
          <p className="result-subtitle">
            Your payment has been verified and your order has been received. We are getting it ready for dispatch.
          </p>
        </div>

        {/* Order Details Cards Grid */}
        <div className="order-details">
          <div className="order-details-header">
            <h2>Order Summary Details</h2>
            <span className="ps-secure-badge">
              <ShieldCheckIcon style={{ fontSize: "1.1rem" }} /> Verified Purchase
            </span>
          </div>

          <div className="detail-grid">
            <div className="detail-item ps-order-id-card">
              <span className="detail-label">Order ID</span>
              <div className="ps-order-id-val-wrap">
                <span className="detail-value ps-order-number">{order_number}</span>
                <button className="ps-inline-copy-btn" onClick={handleCopy} title="Copy Order ID">
                  <ContentCopyIcon style={{ fontSize: "0.95rem" }} />
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            </div>

            <div className="detail-item">
              <span className="detail-label">Payment Status</span>
              <div>
                <span className="status-badge status-paid">● Paid via Online</span>
              </div>
            </div>

            <div className="detail-item">
              <span className="detail-label">Order Status</span>
              <div>
                <span className="status-badge status-confirmed">Confirmed</span>
              </div>
            </div>

            <div className="detail-item ps-date-item">
              <span className="detail-label">Shipping Date</span>
              <span className="detail-value">
                {formatDate(orderData.shipping_date) || "Will be updated soon"}
              </span>
            </div>

            <div className="detail-item ps-date-item ps-delivery">
              <span className="detail-label">Expected Delivery</span>
              <span className="detail-value ps-delivery-value">
                {formatDate(orderData.delivery_date) || "Will be updated soon"}
              </span>
            </div>
          </div>
        </div>

        {/* WhatsApp Notification Card */}
        <div className="ps-whatsapp-banner">
          <div className="ps-wa-icon-wrap">
            <WhatsAppIcon className="ps-wa-icon" />
          </div>
          <div className="ps-wa-content">
            <h4>Instant WhatsApp Updates Active</h4>
            <p>
              Automated dispatch notifications, tracking link, and delivery updates are linked to{" "}
              <strong>{orderData.customer_phone || "your contact number"}</strong>.
            </p>
          </div>
        </div>

        {/* Actions Buttons */}
        <div className="result-actions">
          <button
            className="btn btn-primary"
            onClick={() => navigate("/usertab/home")}
          >
            <ShoppingBagIcon style={{ fontSize: "1.2rem" }} />
            Continue Shopping
          </button>

          <button
            className="btn btn-track"
            onClick={() =>
              navigate("/usertab/track-order", {
                state: {
                  order_number,
                  customer_email: orderData.customer_email,
                  customer_phone: orderData.customer_phone,
                },
              })
            }
          >
            <LocalShippingIcon style={{ fontSize: "1.2rem" }} />
            Track Order Status
          </button>
        </div>

        <div className="payment-footer">
          <p>Thank you for choosing <strong>Humming & Tone</strong>. We appreciate your style!</p>
        </div>
      </div>

      {/* Copy Order ID Modal Overlay */}
      {showModal && (
        <div className="ps-modal-overlay">
          <div className="ps-modal">
            <div className="ps-modal-header">
              <h2>Save Your Order ID</h2>
            </div>
            <div className="ps-modal-body">
              <p className="ps-modal-msg">
                Your order is confirmed! Please copy the Order ID below. You will need this along with your Email or Phone number to track your package status.
              </p>
              <div className="ps-copy-box">
                <span className="ps-modal-order-number">{order_number}</span>
                <button className="ps-copy-btn" onClick={handleCopy} title="Copy Order ID">
                  <ContentCopyIcon style={{ fontSize: "1.2rem" }} />
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>
            <div className="ps-modal-footer">
              <button className="ps-modal-close-btn" onClick={() => setShowModal(false)}>
                Got It, Thank You
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentSuccess;
