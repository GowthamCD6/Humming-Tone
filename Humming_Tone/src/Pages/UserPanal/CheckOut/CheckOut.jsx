import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./CheckOut.css";
import UserFooter from "../../../components/User-Footer-Card/UserFooter";
import { API_BASE_URL } from "../../../utils/apiConfig";
import { fetchSiteContent, getSiteContent } from "../../../utils/siteContentStore";

const CheckOut = ({ onBack }) => {
  const navigate = useNavigate();
  const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID;

  const [shippingFee, setShippingFee] = useState(() => {
    const cached = getSiteContent();
    return Number(cached?.shippingFee != null ? cached.shippingFee : (cached?.footer?.shippingFee || 0));
  });

  const [gstRate, setGstRate] = useState(() => {
    const cached = getSiteContent();
    return Number(cached?.gstRate != null ? cached.gstRate : (cached?.footer?.gstRate || 5));
  });

  const [promoCode, setPromoCode] = useState("");
  const [cartItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("cart")) || [];
    } catch {
      return [];
    }
  });

  const [formData, setFormData] = useState({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    customer_address: "",
    city: "",
    state: "",
    pincode: "",
    order_instructions: "",
  });

  /* ---------------- FETCH DYNAMIC SETTINGS ---------------- */
  useEffect(() => {
    fetchSiteContent().then((data) => {
      if (data) {
        const fee = Number(data.shippingFee != null ? data.shippingFee : (data.footer?.shippingFee || 0));
        const gst = Number(data.gstRate != null ? data.gstRate : (data.footer?.gstRate || 5));
        setShippingFee(fee);
        setGstRate(gst);
      }
    }).catch(() => {});
  }, []);

  /* ---------------- LOAD CART FROM LOCALSTORAGE ---------------- */
  useEffect(() => {
    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      alert("Your cart is empty");
      navigate("/usertab/cart");
    }
  }, [cartItems, navigate]);

  /* ---------------- HELPERS ---------------- */
  const toNumber = (v) => Number(v) || 0;
  const formatMoney = (v) => toNumber(v).toFixed(2);

  /* ---------------- CALCULATIONS ---------------- */
  const subtotal = useMemo(() => {
    return cartItems.reduce(
      (sum, item) => sum + toNumber(item.price) * toNumber(item.quantity),
      0
    );
  }, [cartItems]);

  const discountAmount = promoCode ? 100 : 0;
  const netAmount = Math.max(subtotal - discountAmount, 0);
  const rate = Number(gstRate) || 5;
  // Included GST calculation:
  const gstAmount = netAmount - (netAmount / (1 + rate / 100));
  const shipping = Number(shippingFee) || 0;
  const total = Math.max(netAmount + shipping, 0);

  /* ---------------- HANDLERS ---------------- */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

const handleCheckout = async (e) => {
  e.preventDefault();

  try {
    if (cartItems.length === 0) {
      alert("Cart is empty");
      return;
    }

    const payload = {
      customer_name: formData.customer_name,
      customer_email: formData.customer_email,
      customer_phone: formData.customer_phone,
      customer_address: formData.customer_address,
      city: formData.city,
      state: formData.state,
      pincode: formData.pincode,
      order_instructions: formData.order_instructions || null,

      promo_code: promoCode || null,
      discount_amount: discountAmount,
      gst_amount: gstAmount,
      shipping,

      items: cartItems.map((item) => ({
        product_id: item.id,
        quantity: item.quantity,
        size: item.size,
        color: item.color || null,
      })),
    };

    const res = await fetch(
      `${API_BASE_URL}/user/create_order`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    const result = await res.json();

    if (!res.ok || !result.success) {
      alert(result?.message || "Order creation failed");
      return;
    }

    const { razorpay_order_id, amount, currency } = result.data;

    const options = {
      key: RAZORPAY_KEY,

      // Razorpay expects paise
      amount: Number(amount),
      currency,
      order_id: razorpay_order_id,

      name: "Humming Tone",
      description: "Order Payment",

      prefill: {
        name: result.data.customer_name,
        email: result.data.customer_email,
      },

      theme: { color: "#F37254" },

      handler: function (response) {
        console.log("Payment success:", response);

        // Save order to localStorage for tracking
        const orderInfo = {
          order_number: result.data.order_number,
          customer_email: formData.customer_email,
          customer_phone: formData.customer_phone,
          created_at: new Date().toISOString(),
        };
        const existingOrders = JSON.parse(localStorage.getItem("my_orders")) || [];
        const alreadyExists = existingOrders.some(o => o.order_number === result.data.order_number);
        if (!alreadyExists) {
          existingOrders.unshift(orderInfo);
          if (existingOrders.length > 20) existingOrders.pop();
          localStorage.setItem("my_orders", JSON.stringify(existingOrders));
        }

        // clear cart ONLY after payment
        localStorage.removeItem("cart");
        window.dispatchEvent(new Event('cart:updated'));

        navigate("/usertab/payment-success", {
          state: {
            order_number: result.data.order_number,
            customer_email: formData.customer_email,
            customer_phone: formData.customer_phone,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
          },
        });
      },

      modal: {
        ondismiss: function () {
          console.log("Payment popup closed");

          // Notify backend that payment was aborted/closed
          if (result?.data?.order_number) {
            fetch(`${API_BASE_URL}/user/cancel_order`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                order_number: result.data.order_number,
                reason: "Payment window closed by user"
              })
            }).catch(e => console.error("Error cancelling order:", e));
          }

          navigate("/usertab/payment-failure", {
            state: {
              failureData: {
                errorCode: "PAYMENT_CANCELLED",
                errorMessage: "You closed the payment window before completing the transaction.",
                timestamp: new Date().toISOString(),
                transactionId: result.data.order_number,
                amount: Number(amount) / 100,
                reason: "Payment was cancelled by the user",
                attemptedPaymentMethod: "Razorpay"
              }
            }
          });
        },
      },
    };

    if (!window.Razorpay) {
      alert("Razorpay SDK not loaded");
      return;
    }

    const razorpay = new window.Razorpay(options);
    razorpay.open();

  } catch (err) {
    console.error(err);
    alert("Something went wrong");
  }
};


  const handleBack = () => {
    if (onBack) return onBack();
    navigate("/usertab/cart");
  };

  return (
    <>
      <div className="userpanal-checkout-page">
        <header className="userpanal-checkout-header">
          <h1 className="userpanal-checkout-page-title">Checkout</h1>
          <p className="userpanal-checkout-page-subtitle">
            Complete your purchase with secure payment
          </p>
        </header>

        <div className="userpanal-checkout-layout">
          <div className="userpanal-checkout-left-column">
            <section className="userpanal-checkout-section">
              <h2 className="userpanal-checkout-section-title">
                Shipping Information
              </h2>

              {/* 🔴 prevent default form submit */}
              <form
                className="userpanal-checkout-form-grid"
                onSubmit={(e) => e.preventDefault()}
              >
                {[
                  ["customer_name", "Full Name"],
                  ["customer_email", "Email Address"],
                  ["customer_phone", "Phone Number"],
                  ["customer_address", "Complete Address"],
                  ["city", "City"],
                  ["state", "State"],
                  ["pincode", "Pin Code"],
                ].map(([name, label]) => (
                  <div
                    key={name}
                    className={`userpanal-checkout-form-group ${
                      name === "customer_address"
                        ? "userpanal-checkout-form-full"
                        : ""
                    }`}
                  >
                    <label className="userpanal-checkout-form-label userpanal-checkout-required">
                      {label}
                    </label>
                    {name === "customer_address" ? (
                      <textarea
                        name={name}
                        placeholder={`Enter your ${label.toLowerCase()}`}
                        className="userpanal-checkout-form-textarea"
                        value={formData[name]}
                        onChange={handleChange}
                      />
                    ) : (
                      <input
                        type="text"
                        name={name}
                        placeholder={`Enter your ${label.toLowerCase()}`}
                        className="userpanal-checkout-form-input"
                        value={formData[name]}
                        onChange={handleChange}
                      />
                    )}
                  </div>
                ))}

                <div className="userpanal-checkout-form-group userpanal-checkout-form-full">
                  <label className="userpanal-checkout-form-label">
                    Order Instructions (Optional)
                  </label>
                  <textarea
                    name="order_instructions"
                    placeholder="Any special instructions for your order?"
                    className="userpanal-checkout-form-textarea"
                    value={formData.order_instructions}
                    onChange={handleChange}
                  />
                </div>
              </form>

              <button
                className="userpanal-checkout-btn"
                type="button"
                onClick={(e) => handleCheckout(e)}
              >
                PROCEED TO PAYMENT - ₹{formatMoney(total)}
              </button>
            </section>
          </div>

          <div className="userpanal-checkout-right-column">
            <section className="userpanal-checkout-section">
              <h2 className="userpanal-checkout-section-title">Promo Code</h2>
              <div className="userpanal-checkout-promo-form">
                <div className="userpanal-checkout-promo-input-group">
                  <input
                    type="text"
                    placeholder="Enter promo code"
                    className="userpanal-checkout-promo-input"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                  />
                  <button className="userpanal-checkout-apply-promo-btn">
                    Apply
                  </button>
                </div>
              </div>
            </section>

            <section className="userpanal-checkout-section">
              <h2 className="userpanal-checkout-section-title">
                Order Summary
              </h2>

              <div className="userpanal-checkout-order-items">
                {cartItems.map((item) => (
                  <div key={item.id} className="userpanal-checkout-order-item">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="userpanal-checkout-order-item-image"
                    />
                    <div className="userpanal-checkout-order-item-details">
                      <div className="userpanal-checkout-order-item-name">
                        {item.name}
                      </div>
                      <div className="userpanal-checkout-order-item-meta">
                        <div>Quantity: {item.quantity}</div>
                        <div>Size: {item.size}</div>
                        <div>Color: {item.color}</div>
                      </div>
                    </div>
                    <div className="userpanal-checkout-order-item-price">
                      ₹{formatMoney(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="userpanal-checkout-order-summary">
                <div className="userpanal-checkout-summary-row">
                  <span className="userpanal-checkout-summary-label">Subtotal</span>
                  <span className="userpanal-checkout-summary-value">₹{formatMoney(subtotal)}</span>
                </div>
                <div className="userpanal-checkout-summary-row">
                  <span className="userpanal-checkout-summary-label">Discount</span>
                  <span className="userpanal-checkout-summary-value">-₹{formatMoney(discountAmount)}</span>
                </div>
                <div className="userpanal-checkout-summary-row">
                  <span className="userpanal-checkout-summary-label">Shipping</span>
                  <span className="userpanal-checkout-summary-value">₹{formatMoney(shipping)}</span>
                </div>
                <div className="userpanal-checkout-summary-divider" />
                <div className="userpanal-checkout-summary-row userpanal-checkout-summary-row-last">
                  <span className="userpanal-checkout-summary-label">Total</span>
                  <span className="userpanal-checkout-summary-total">₹{formatMoney(total)}</span>
                </div>
              </div>
            </section>

            <button
              className="userpanal-checkout-back-btn"
              onClick={handleBack}
            >
              ← BACK TO CART
            </button>
          </div>
        </div>
      </div>

      <UserFooter />
    </>
  );
};

export default CheckOut;
