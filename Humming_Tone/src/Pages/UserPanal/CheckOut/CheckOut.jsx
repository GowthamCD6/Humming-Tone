import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CheckOut.css';

const CheckOut = ({ onBack }) => {
  const navigate = useNavigate();
  const [promoCode, setPromoCode] = useState('');

  // Mock cart data (placeholder)
  const [cartItems] = useState([
    {
      id: 1,
      name: 'Blue set',
      quantity: 1,
      size: '12-18 months',
      color: 'Navy, blue, white',
      price: 400.0,
      image: 'https://images.unsplash.com/photo-1522771913700-0937c229392e?w=400&h=400&fit=crop',
    },
  ]);

  const subtotal = 400.0;
  const shipping = 50.0;
  const total = subtotal + shipping;

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }
    navigate(-1);
  };

  return (
    <div className="userpanal-checkout-page">
      <header className="userpanal-checkout-header">
        <h1 className="userpanal-checkout-page-title">Checkout</h1>
        <p className="userpanal-checkout-page-subtitle">Complete your purchase with secure payment</p>
      </header>

      <div className="userpanal-checkout-layout">
        <div className="userpanal-checkout-left-column">
          <section className="userpanal-checkout-section">
            <h2 className="userpanal-checkout-section-title">Shipping Information</h2>

            <form className="userpanal-checkout-form-grid">
              <div className="userpanal-checkout-form-group">
                <label className="userpanal-checkout-form-label userpanal-checkout-required">Full Name</label>
                <input type="text" className="userpanal-checkout-form-input" placeholder="Enter your full name" />
              </div>

              <div className="userpanal-checkout-form-group">
                <label className="userpanal-checkout-form-label userpanal-checkout-required">Email Address</label>
                <input
                  type="email"
                  className="userpanal-checkout-form-input"
                  placeholder="Enter your email address"
                />
              </div>

              <div className="userpanal-checkout-form-group userpanal-checkout-form-full">
                <label className="userpanal-checkout-form-label userpanal-checkout-required">Phone Number</label>
                <input
                  type="tel"
                  className="userpanal-checkout-form-input"
                  placeholder="Enter your phone number"
                />
              </div>

              <div className="userpanal-checkout-form-group userpanal-checkout-form-full">
                <label className="userpanal-checkout-form-label userpanal-checkout-required">Complete Address</label>
                <textarea
                  className="userpanal-checkout-form-textarea"
                  placeholder="Enter your complete delivery address"
                />
              </div>

              <div className="userpanal-checkout-form-group">
                <label className="userpanal-checkout-form-label userpanal-checkout-required">City</label>
                <input type="text" className="userpanal-checkout-form-input" placeholder="Enter your city" />
              </div>

              <div className="userpanal-checkout-form-group">
                <label className="userpanal-checkout-form-label userpanal-checkout-required">State</label>
                <input type="text" className="userpanal-checkout-form-input" placeholder="Enter your state" />
              </div>

              <div className="userpanal-checkout-form-group">
                <label className="userpanal-checkout-form-label userpanal-checkout-required">Pin Code</label>
                <input type="text" className="userpanal-checkout-form-input" placeholder="Enter PIN code" />
              </div>

              <div className="userpanal-checkout-form-group userpanal-checkout-form-full">
                <label className="userpanal-checkout-form-label">Order Instructions (Optional)</label>
                <textarea
                  className="userpanal-checkout-form-textarea"
                  placeholder="Any special instructions for your order..."
                />
              </div>
            </form>

            <button className="userpanal-checkout-btn" type="button">
              PROCEED TO PAYMENT - ₹{total.toFixed(2)}
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
                  placeholder="Enter promo code"
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
            <h2 className="userpanal-checkout-section-title">Order Summary</h2>

            <div className="userpanal-checkout-order-items">
              {cartItems.map((item) => (
                <div key={item.id} className="userpanal-checkout-order-item">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="userpanal-checkout-order-item-image"
                  />
                  <div className="userpanal-checkout-order-item-details">
                    <div className="userpanal-checkout-order-item-name">{item.name}</div>
                    <div className="userpanal-checkout-order-item-meta">
                      <div>Quantity: {item.quantity}</div>
                      <div>Size: {item.size}</div>
                      <div>Color: {item.color}</div>
                    </div>
                  </div>
                  <div className="userpanal-checkout-order-item-price">₹{item.price.toFixed(2)}</div>
                </div>
              ))}
            </div>

            <div className="userpanal-checkout-order-summary">
              <div className="userpanal-checkout-summary-row">
                <span className="userpanal-checkout-summary-label">Subtotal</span>
                <span className="userpanal-checkout-summary-value">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="userpanal-checkout-summary-row">
                <span className="userpanal-checkout-summary-label">Shipping</span>
                <span className="userpanal-checkout-summary-value">₹{shipping.toFixed(2)}</span>
              </div>
              <div className="userpanal-checkout-summary-divider" />
              <div className="userpanal-checkout-summary-row userpanal-checkout-summary-row-last">
                <span className="userpanal-checkout-summary-total">Total</span>
                <span className="userpanal-checkout-summary-total">₹{total.toFixed(2)}</span>
              </div>
            </div>
          </section>

          <button className="userpanal-checkout-back-btn" onClick={handleBack} type="button">
            ← BACK TO CART
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckOut;