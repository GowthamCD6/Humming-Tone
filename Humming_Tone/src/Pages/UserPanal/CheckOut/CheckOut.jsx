import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./CheckOut.css";
import UserFooter from "../../../components/User-Footer-Card/UserFooter";

const CheckOut = ({ onBack }) => {
  const navigate = useNavigate();
  const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID;

  const [promoCode, setPromoCode] = useState("");
  const [cartItems, setCartItems] = useState([]);

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

  /* ---------------- LOAD CART FROM LOCALSTORAGE ---------------- */
  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];

    if (!Array.isArray(storedCart) || storedCart.length === 0) {
      alert("Your cart is empty");
      navigate("/usertab/cart");
      return;
    }

    setCartItems(storedCart);
  }, [navigate]);

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
  const shipping = 50;
  const total = Math.max(subtotal - discountAmount + shipping, 0);

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
      shipping,
      items: cartItems.map(item => ({
        product_id: item.id,
        quantity: item.quantity,
        size: item.size,
        color: item.color || null
      }))
    };

    const res = await fetch("http://localhost:5000/user/create_order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await res.json();
    if (!res.ok || !result.success) {
      alert(result?.message || "Order creation failed");
      return;
    }

    const { razorpay_order_id, amount, currency, order_number } = result.data;

    const options = {
      key: RAZORPAY_KEY,
      amount: Number(amount),
      currency,
      order_id: razorpay_order_id,
      name: "Humming Tone",
      description: "Order Payment",
      prefill: {
        name: payload.customer_name,
        email: payload.customer_email,
      },
      handler: function () {
        // redirects to success page 
        navigate("/usertab/payment-success", {
          state: { order_number }
        });
      },
      modal: { // it will be called on dismissed
        ondismiss: function () {
          navigate("/usertab/payment-failure", {
            state: { order_number }
          });
        },
      },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();

  } catch (err) {
    console.error(err);
    alert("Something went wrong");
  }
};



  const handleBack = () => {
    if (onBack) return onBack();
    navigate(-1);
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
                        className="userpanal-checkout-form-textarea"
                        value={formData[name]}
                        onChange={handleChange}
                      />
                    ) : (
                      <input
                        type="text"
                        name={name}
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
                  <span>Subtotal</span>
                  <span>₹{formatMoney(subtotal)}</span>
                </div>
                <div className="userpanal-checkout-summary-row">
                  <span>Discount</span>
                  <span>-₹{formatMoney(discountAmount)}</span>
                </div>
                <div className="userpanal-checkout-summary-row">
                  <span>Shipping</span>
                  <span>₹{formatMoney(shipping)}</span>
                </div>
                <div className="userpanal-checkout-summary-divider" />
                <div className="userpanal-checkout-summary-row userpanal-checkout-summary-row-last">
                  <span>Total</span>
                  <span>₹{formatMoney(total)}</span>
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
