import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HomeIcon from "@mui/icons-material/Home";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import "./PaymentSuccess.css";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const order_number = location.state?.order_number;
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!order_number) {
      navigate("/usertab/home");
      return;
    }

    const verifyPayment = async () => {
      try {
        const res = await fetch(
          "http://localhost:5000/user/get_payment_status",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ order_number }),
          }
        );

        const data = await res.json();

        if (data.msg !== "payment verified") {
          navigate("/usertab/payment-failure", {
            state: { order_number },
          });
          return;
        }

        // OPTIONAL: fetch full order details here later
        setOrderData({
          order_number,
        });
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
  }, [order_number, navigate]);

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
    <div className="payment-result">
      {/* Success Header */}
      <div className="result-header">
        <CheckCircleIcon className="result-icon" style={{ color: "#27ae60" }} />
        <h1>Payment Successful!</h1>
        <p>Your payment has been verified successfully.</p>
      </div>

      {/* Order Summary */}
      <div className="order-details">
        <h2>Order Details</h2>
        <div className="detail-grid">
          <div className="detail-item">
            <span className="detail-label">Order Number</span>
            <span className="detail-value">{order_number}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Payment Status</span>
            <span className="status-badge status-paid">Paid</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Order Status</span>
            <span className="status-badge status-confirmed">Confirmed</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="result-actions">
        <button
          className="btn btn-primary"
          onClick={() => navigate("/usertab/home")}
        >
          <HomeIcon />
          Continue Shopping
        </button>

        <button
          className="btn btn-secondary"
          onClick={() => navigate("/usertab/orders")}
        >
          <ShoppingBagIcon />
          View Orders
        </button>
      </div>

      <div className="payment-footer">
        <p>Thank you for shopping with Humming & Tone!</p>
      </div>
    </div>
  );
};

export default PaymentSuccess;
