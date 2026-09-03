import React, { useState, useMemo, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import {
  UserCheck,
  ShieldCheck,
  Sparkles,
  Lock,
  Truck,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import "./CheckOut.css";
import UserFooter from "../../../components/User-Footer-Card/UserFooter";
import { API_BASE_URL } from "../../../utils/apiConfig";
import { fetchSiteContent, getSiteContent } from "../../../utils/siteContentStore";

const CheckOut = ({ onBack }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID;

  const buyNowItem = location.state?.buyNowItem;
  const isBuyNow = Boolean(buyNowItem);

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
    if (buyNowItem) {
      return Array.isArray(buyNowItem) ? buyNowItem : [buyNowItem];
    }
    try {
      return JSON.parse(localStorage.getItem("cart")) || [];
    } catch {
      return [];
    }
  });

  const [customerUser, setCustomerUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("customerUser")) || null;
    } catch {
      return null;
    }
  });

  const [isFetchingAddress, setIsFetchingAddress] = useState(false);
  const [addressLoaded, setAddressLoaded] = useState(false);
  const [avatarImgError, setAvatarImgError] = useState(false);

  const userInitials = useMemo(() => {
    const name = customerUser?.name || "";
    const email = customerUser?.email || "";
    if (name.trim()) {
      const parts = name.trim().split(/\s+/);
      if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      }
      return name.slice(0, 2).toUpperCase();
    }
    if (email.trim()) {
      return email.slice(0, 2).toUpperCase();
    }
    return "HT";
  }, [customerUser]);

  const [formData, setFormData] = useState(() => {
    const user = JSON.parse(localStorage.getItem("customerUser") || "null");
    return {
      customer_name: user?.name || "",
      customer_email: user?.email || "",
      customer_phone: user?.phone || "",
      customer_address: user?.address || "",
      city: user?.city || "",
      state: user?.state || "",
      pincode: user?.pincode || "",
      order_instructions: "",
    };
  });

  /* ---------------- FETCH DYNAMIC SETTINGS ---------------- */
  useEffect(() => {
    fetchSiteContent()
      .then((data) => {
        if (data) {
          const fee = Number(data.shippingFee != null ? data.shippingFee : (data.footer?.shippingFee || 0));
          const gst = Number(data.gstRate != null ? data.gstRate : (data.footer?.gstRate || 5));
          setShippingFee(fee);
          setGstRate(gst);
        }
      })
      .catch(() => {});
  }, []);

  /* ---------------- LOAD CART FROM LOCALSTORAGE ---------------- */
  useEffect(() => {
    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      alert("Your cart is empty");
      navigate("/usertab/cart");
    }
  }, [cartItems, navigate]);

  /* ---------------- FETCH SAVED ADDRESS DYNAMICALLY ---------------- */
  useEffect(() => {
    const loadSavedAddress = async () => {
      const token = localStorage.getItem("userToken");
      if (!token) return;

      setIsFetchingAddress(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        const data = await res.json();

        if (res.ok && data.user) {
          setCustomerUser(data.user);
          localStorage.setItem("customerUser", JSON.stringify(data.user));

          setFormData((prev) => ({
            ...prev,
            customer_name: data.user.name || prev.customer_name,
            customer_email: data.user.email || prev.customer_email,
            customer_phone: data.user.phone || prev.customer_phone,
            customer_address: data.user.address || prev.customer_address,
            city: data.user.city || prev.city,
            state: data.user.state || prev.state,
            pincode: data.user.pincode || prev.pincode,
          }));

          if (data.user.address || data.user.phone) {
            setAddressLoaded(true);
          }
        }
      } catch (err) {
        console.warn("Could not fetch user profile:", err);
      } finally {
        setIsFetchingAddress(false);
      }
    };

    if (customerUser) {
      loadSavedAddress();
    }
  }, []);

  /* ---------------- GOOGLE LOGIN SUCCESS HANDLER ---------------- */
  const handleGoogleCheckoutSuccess = async (credentialResponse) => {
    if (!credentialResponse?.credential) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/google/user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: credentialResponse.credential }),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        localStorage.setItem("userToken", data.token);
        localStorage.setItem("customerUser", JSON.stringify(data.user));
        setCustomerUser(data.user);

        // Auto-fill all contact & saved address details
        setFormData((prev) => ({
          ...prev,
          customer_name: data.user.name || prev.customer_name,
          customer_email: data.user.email || prev.customer_email,
          customer_phone: data.user.phone || prev.customer_phone,
          customer_address: data.user.address || prev.customer_address,
          city: data.user.city || prev.city,
          state: data.user.state || prev.state,
          pincode: data.user.pincode || prev.pincode,
        }));

        if (data.user.address || data.user.phone) {
          setAddressLoaded(true);
        }

        window.dispatchEvent(new Event("user:auth_changed"));
      } else {
        alert(data.error?.message || data.message || "Google Sign-In failed. Please try again.");
      }
    } catch (err) {
      console.error("Google checkout auto-fill error:", err);
      alert("Unable to authenticate with Google. Please try again.");
    }
  };

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
  const gstAmount = netAmount - (netAmount / (1 + rate / 100));
  const shipping = Number(shippingFee) || 0;
  const total = Math.max(netAmount + shipping, 0);

  /* ---------------- HANDLERS ---------------- */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckout = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    if (!customerUser || customerUser.email === 'guest@hummingtone.com') {
      alert("Please sign in with your Google account to proceed with checkout.");
      return;
    }

    if (cartItems.length === 0) {
      alert("Cart is empty");
      return;
    }

    // Required field validation
    if (
      !formData.customer_name.trim() ||
      !formData.customer_email.trim() ||
      !formData.customer_phone.trim() ||
      !formData.customer_address.trim() ||
      !formData.city.trim() ||
      !formData.state.trim() ||
      !formData.pincode.trim()
    ) {
      alert("Please complete all required shipping address fields.");
      return;
    }

    try {
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
        user_id: customerUser?.id || null,

        items: cartItems.map((item) => ({
          product_id: item.id,
          quantity: item.quantity,
          size: item.size,
          color: item.color || null,
        })),
      };

      const res = await fetch(`${API_BASE_URL}/user/create_order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        alert(result?.message || "Order creation failed");
        return;
      }

      const { razorpay_order_id, amount, currency } = result.data;

      const options = {
        key: result?.data?.key_id || RAZORPAY_KEY,
        amount: Number(amount),
        currency,
        order_id: razorpay_order_id,

        name: "Humming Tone",
        description: "Order Payment",

        prefill: {
          name: result.data.customer_name,
          email: result.data.customer_email,
          contact: formData.customer_phone,
        },

        theme: { color: "#704F38" },

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
          const alreadyExists = existingOrders.some((o) => o.order_number === result.data.order_number);
          if (!alreadyExists) {
            existingOrders.unshift(orderInfo);
            if (existingOrders.length > 20) existingOrders.pop();
            localStorage.setItem("my_orders", JSON.stringify(existingOrders));
          }

          // clear general cart ONLY after a general cart checkout (preserve cart on Buy Now)
          if (!isBuyNow) {
            localStorage.removeItem("cart");
            window.dispatchEvent(new Event("cart:updated"));
          }

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
          confirm_close: true,
          ondismiss: function () {
            console.log("Payment popup closed");

            if (result?.data?.order_number) {
              fetch(`${API_BASE_URL}/user/cancel_order`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  order_number: result.data.order_number,
                  reason: "Payment window closed by user",
                }),
              }).catch((e) => console.error("Error cancelling order:", e));
            }

            navigate("/usertab/payment-failure", {
              state: {
                failureData: {
                  errorCode: "PAYMENT_CANCELLED",
                  errorMessage: "You closed the payment window before completing the transaction.",
                  timestamp: new Date().toISOString(),
                  transactionId: result.data.order_number,
                  amount: Number(amount) / 100,
                  reason: "Payment was cancelled or closed by the user",
                  attemptedPaymentMethod: "Razorpay",
                },
              },
            });
          },
        },
      };

      if (!window.Razorpay) {
        alert("Razorpay payment gateway is currently loading. Please try again in a moment.");
        return;
      }

      const razorpay = new window.Razorpay(options);

      razorpay.on("payment.failed", function (response) {
        console.error("Razorpay Payment Failed:", response.error);

        if (result?.data?.order_number) {
          fetch(`${API_BASE_URL}/user/cancel_order`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              order_number: result.data.order_number,
              reason: response.error?.description || "Payment failed at gateway",
            }),
          }).catch((e) => console.error("Error cancelling order on failure:", e));
        }

        navigate("/usertab/payment-failure", {
          state: {
            failureData: {
              errorCode: response.error?.code || "PAYMENT_FAILED",
              errorMessage: response.error?.description || "Payment failed. Please try again or use another payment method.",
              timestamp: new Date().toISOString(),
              transactionId: result.data.order_number,
              amount: Number(amount) / 100,
              reason: response.error?.reason || response.error?.description || "Gateway payment decline",
              attemptedPaymentMethod: response.error?.source || "Razorpay",
            },
          },
        });
      });

      razorpay.open();
    } catch (err) {
      console.error(err);
      alert("Something went wrong with checkout");
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
          <h1 className="userpanal-checkout-page-title">Secure Checkout</h1>
          <p className="userpanal-checkout-page-subtitle">
            Authenticated purchase with live order tracking & delivery updates
          </p>
        </header>

        <div className="userpanal-checkout-layout">
          <div className="userpanal-checkout-left-column">
            <section className="userpanal-checkout-section">
              <div className="checkout-section-header-flex">
                <h2 className="userpanal-checkout-section-title">
                  Shipping Information
                </h2>
                {customerUser && (
                  <div className="checkout-logged-badge">
                    <UserCheck size={15} />
                    <span>Verified Buyer: <strong>{customerUser.name || customerUser.email}</strong></span>
                  </div>
                )}
              </div>

              {/* ── MANDATORY GOOGLE LOGIN GATE (When not authenticated) ── */}
              {!customerUser ? (
                <div className="checkout-auth-gate-card">
                  <div className="checkout-auth-gate-icon">
                    <Lock size={30} />
                  </div>
                  <h3 className="checkout-auth-gate-title">Google Sign-In Required</h3>
                  <p className="checkout-auth-gate-desc">
                    To safeguard your order, enable real-time tracking, and auto-load your delivery address, please sign in with your Google account.
                  </p>

                  <div className="checkout-auth-gate-btn-wrap">
                    <GoogleLogin
                      onSuccess={handleGoogleCheckoutSuccess}
                      onError={() => alert("Google Sign-In failed.")}
                      theme="filled_blue"
                      shape="pill"
                      size="large"
                      text="continue_with"
                      width="300"
                    />
                  </div>

                  <div className="checkout-auth-perks">
                    <div className="checkout-auth-perk-item">
                      <ShieldCheck size={16} />
                      <span>100% Encrypted & Safe</span>
                    </div>
                    <div className="checkout-auth-perk-item">
                      <Truck size={16} />
                      <span>Live Order Tracking</span>
                    </div>
                    <div className="checkout-auth-perk-item">
                      <Sparkles size={16} />
                      <span>Saved Address Auto-Fill</span>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* ── LOGGED IN USER INFO & AUTO-FILL STATUS ── */}
                  <div className="checkout-logged-user-bar">
                    <div className="checkout-logged-user-info">
                      {customerUser.avatar_url && !avatarImgError ? (
                        <img
                          src={customerUser.avatar_url}
                          alt={customerUser.name || "User"}
                          className="checkout-logged-avatar"
                          referrerPolicy="no-referrer"
                          crossOrigin="anonymous"
                          onError={() => setAvatarImgError(true)}
                        />
                      ) : (
                        <div className="checkout-logged-avatar-initials">
                          {userInitials}
                        </div>
                      )}
                      <div>
                        <div className="checkout-logged-user-name">{customerUser.name || "Patron"}</div>
                        <div className="checkout-logged-user-email">{customerUser.email}</div>
                      </div>
                    </div>

                    {isFetchingAddress ? (
                      <span className="checkout-autofill-badge" style={{ color: "#704F38", borderColor: "#EAE2D8", background: "#FAF5EE" }}>
                        <RefreshCw size={12} className="spin-icon" /> Syncing Saved Address...
                      </span>
                    ) : addressLoaded ? (
                      <span className="checkout-autofill-badge">
                        <CheckCircle2 size={13} /> Saved Address Auto-Filled
                      </span>
                    ) : null}
                  </div>

                  {/* ── SHIPPING ADDRESS FORM ── */}
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
                            required
                          />
                        ) : (
                          <input
                            type={name === "customer_phone" ? "tel" : name === "customer_email" ? "email" : "text"}
                            name={name}
                            placeholder={`Enter your ${label.toLowerCase()}`}
                            className="userpanal-checkout-form-input"
                            value={formData[name]}
                            onChange={handleChange}
                            required
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
                        placeholder="Any special instructions for your order or delivery?"
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
                </>
              )}
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
                  <button className="userpanal-checkout-apply-promo-btn" type="button">
                    Apply
                  </button>
                </div>
              </div>
            </section>

            <section className="userpanal-checkout-section">
              <h2 className="userpanal-checkout-section-title">
                Order Summary ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} items)
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
                        {item.color && <div>Color: {item.color}</div>}
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
                  <span className="userpanal-checkout-summary-value">
                    {shipping === 0 ? "FREE" : `₹${formatMoney(shipping)}`}
                  </span>
                </div>
                <div className="userpanal-checkout-summary-divider" />
                <div className="userpanal-checkout-summary-row userpanal-checkout-summary-row-last">
                  <span className="userpanal-checkout-summary-label">Total Amount</span>
                  <span className="userpanal-checkout-summary-total">₹{formatMoney(total)}</span>
                </div>
              </div>
            </section>

            <button
              className="userpanal-checkout-back-btn"
              onClick={handleBack}
              type="button"
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
