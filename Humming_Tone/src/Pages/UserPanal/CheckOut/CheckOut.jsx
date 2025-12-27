import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CheckOut = ({ onBack }) => {
    const navigate = useNavigate();
    const [promoCode, setPromoCode] = useState('');
    const [isPromoApplied, setIsPromoApplied] = useState(false);

    // Mock cart data based on the image
    const [cartItems] = useState([
        {
            id: 1,
            name: 'Blue set',
            quantity: 1,
            size: '12-18 months',
            color: 'Navy, blue, white',
            price: 400.00,
            image: 'https://images.unsplash.com/photo-1522771913700-0937c229392e?w=400&h=400&fit=crop'
        }
    ]);

    const subtotal = 400.00;
    const shipping = 50.00;
    const total = subtotal + shipping;

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            navigate(-1);
        }
    };

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '1rem 2rem' }}>
            <style>{CSS_STYLES}</style>

            <header className="checkout-header">
                <h1 className="page-title">Checkout</h1>
                <p className="page-subtitle">Complete your purchase with secure payment</p>
            </header>

            <div className="checkout-layout">
                {/* Left Column: Shipping Information */}
                <div className="checkout-left-column">
                    <section className="checkout-section">
                        <h2 className="section-title">Shipping Information</h2>

                        <form className="form-grid">
                            <div className="form-group">
                                <label className="form-label required">Full Name</label>
                                <input type="text" className="form-input" placeholder="Enter your full name" />
                            </div>

                            <div className="form-group">
                                <label className="form-label required">Email Address</label>
                                <input type="email" className="form-input" placeholder="Enter your email address" />
                            </div>

                            <div className="form-group form-full">
                                <label className="form-label required">Phone Number</label>
                                <input type="tel" className="form-input" placeholder="Enter your phone number" />
                            </div>

                            <div className="form-group form-full">
                                <label className="form-label required">Complete Address</label>
                                <textarea className="form-textarea" placeholder="Enter your complete delivery address"></textarea>
                            </div>

                            <div className="form-group">
                                <label className="form-label required">City</label>
                                <input type="text" className="form-input" placeholder="Enter your city" />
                            </div>

                            <div className="form-group">
                                <label className="form-label required">State</label>
                                <input type="text" className="form-input" placeholder="Enter your state" />
                            </div>

                            <div className="form-group">
                                <label className="form-label required">Pin Code</label>
                                <input type="text" className="form-input" placeholder="Enter PIN code" />
                            </div>

                            <div className="form-group form-full">
                                <label className="form-label">Order Instructions (Optional)</label>
                                <textarea className="form-textarea" placeholder="Any special instructions for your order..."></textarea>
                            </div>
                        </form>

                        <button className="checkout-btn">
                            PROCEED TO PAYMENT - ₹{total.toFixed(2)}
                        </button>
                    </section>
                </div>

                {/* Right Column: Promo Code & Order Summary */}
                <div className="checkout-right-column">
                    {/* Promo Code Section */}
                    <section className="checkout-section">
                        <h2 className="section-title">Promo Code</h2>
                        <div className="promo-form">
                            <div className="promo-input-group">
                                <input
                                    type="text"
                                    className="promo-input"
                                    placeholder="Enter promo code"
                                    value={promoCode}
                                    onChange={(e) => setPromoCode(e.target.value)}
                                />
                                <button className="apply-promo-btn">Apply</button>
                            </div>
                        </div>
                    </section>

                    {/* Order Summary Section */}
                    <section className="checkout-section">
                        <h2 className="section-title">Order Summary</h2>

                        <div className="order-items">
                            {cartItems.map(item => (
                                <div key={item.id} className="order-item">
                                    <img src={item.image} alt={item.name} className="order-item-image" />
                                    <div className="order-item-details">
                                        <div className="order-item-name">{item.name}</div>
                                        <div className="order-item-meta">
                                            <div>Quantity: {item.quantity}</div>
                                            <div>Size: {item.size}</div>
                                            <div>Color: {item.color}</div>
                                        </div>
                                    </div>
                                    <div className="order-item-price">₹{item.price.toFixed(2)}</div>
                                </div>
                            ))}
                        </div>

                        <div className="order-summary">
                            <div className="summary-row">
                                <span className="summary-label">Subtotal</span>
                                <span className="summary-value">₹{subtotal.toFixed(2)}</span>
                            </div>
                            <div className="summary-row">
                                <span className="summary-label">Shipping</span>
                                <span className="summary-value">₹{shipping.toFixed(2)}</span>
                            </div>
                            <div className="summary-divider"></div>
                            <div className="summary-row" style={{ borderBottom: 'none', marginBottom: 0, paddingBottom: 0 }}>
                                <span className="summary-total">Total</span>
                                <span className="summary-total">₹{total.toFixed(2)}</span>
                            </div>
                        </div>
                    </section>

                    <button className="back-btn" onClick={handleBack}>
                        ← BACK TO CART
                    </button>
                </div>
            </div>
        </div>
    );
};

const CSS_STYLES = `
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap');

    /* Modern Minimalist Checkout - Premium E-Commerce */

    /* Page Header */
    .checkout-header {
        margin-bottom: 2rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid #e8e8e8;
        animation: fadeInDown 0.6s ease-out;
    }

    @keyframes fadeInDown {
        from {
            opacity: 0;
            transform: translateY(-20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .page-title {
        font-family: 'Playfair Display', serif;
        font-size: 3.5rem;
        color: #1a1a1a;
        margin: 0 0 1rem 0;
        font-weight: 300;
        letter-spacing: -0.03em;
        position: relative;
        display: inline-block;
    }

    .page-subtitle {
        color: #666;
        font-size: 1.15rem;
        margin: 1.5rem 0 0 0;
        font-weight: 300;
        line-height: 1.6;
    }

    /* Checkout Layout */
    .checkout-layout {
        display: grid;
        grid-template-columns: 1.8fr 1fr;
        gap: 4rem;
        align-items: start;
        animation: fadeIn 0.6s ease-out 0.2s both;
    }

    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }

    /* Checkout Sections */
    .checkout-section {
        background: white;
        padding: 3rem;
        border-radius: 0;
        box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
        border: 1px solid #e8e8e8;
        position: relative;
        margin-bottom: 2rem;
    }

    .checkout-section::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: linear-gradient(90deg, #1a1a1a 0%, #666 50%, #1a1a1a 100%);
    }

    .section-title {
        font-family: 'Playfair Display', serif;
        font-size: 1.8rem;
        color: #1a1a1a;
        margin-bottom: 2rem;
        padding-bottom: 1rem;
        border-bottom: 2px solid #f5f5f5;
        font-weight: 300;
        letter-spacing: -0.02em;
    }

    /* Form Styles */
    .form-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1.5rem;
        margin-bottom: 1.5rem;
    }

    .form-full {
        grid-column: 1 / -1;
    }

    .form-group {
        margin-bottom: 1.5rem;
    }

    .form-label {
        display: block;
        font-weight: 500;
        color: #1a1a1a;
        margin-bottom: 0.75rem;
        font-size: 0.8rem;
        text-transform: uppercase;
        letter-spacing: 0.12em;
        font-family: 'Inter', sans-serif;
    }

    .form-label.required::after {
        content: \" *\";
        color: #e74c3c;
        font-weight: 700;
    }

    .form-input,
    .form-textarea {
        width: 100%;
        padding: 16px 20px;
        border: 2px solid #e8e8e8;
        border-radius: 0;
        font-size: 15px;
        font-family: 'Inter', sans-serif;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        background: #fafafa;
        color: #1a1a1a;
    }

    .form-input:hover,
    .form-textarea:hover {
        border-color: #bbb;
        background: white;
    }

    .form-input:focus,
    .form-textarea:focus {
        outline: none;
        border-color: #1a1a1a;
        background: white;
        box-shadow: 0 0 0 4px rgba(26, 26, 26, 0.05);
    }

    .form-textarea {
        resize: vertical;
        min-height: 120px;
        line-height: 1.6;
    }

    /* Order Items */
    .order-items {
        margin-bottom: 2.5rem;
    }

    .order-item {
        display: flex;
        gap: 1.5rem;
        padding: 1.5rem 0;
        border-bottom: 1px solid #f5f5f5;
        align-items: flex-start;
        transition: all 0.3s ease;
    }

    .order-item:hover {
        background: #fafafa;
        margin: 0 -1.5rem;
        padding: 1.5rem;
        border-radius: 0;
    }

    .order-item:last-child {
        border-bottom: none;
    }

    .order-item-image {
        width: 90px;
        height: 90px;
        object-fit: cover;
        border-radius: 0;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
        transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        filter: grayscale(0.1);
        flex-shrink: 0;
    }

    .order-item-details {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
        min-height: 90px;
    }

    .order-item-name {
        font-size: 1.05rem;
        font-weight: 500;
        color: #1a1a1a;
        margin-bottom: 0.5rem;
        line-height: 1.3;
        letter-spacing: -0.01em;
    }

    .order-item-meta {
        color: #666;
        font-size: 0.85rem;
        line-height: 1.6;
    }

    .order-item-price {
        font-size: 1.2rem;
        font-weight: 700;
        color: #1a1a1a;
        text-align: right;
        letter-spacing: -0.02em;
        flex-shrink: 0;
        align-self: center;
    }

    /* Order Summary */
    .order-summary {
        background: linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%);
        padding: 2.5rem;
        border-radius: 0;
        margin-bottom: 2.5rem;
        border: 1px solid #e8e8e8;
    }

    .summary-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.25rem;
        padding-bottom: 1.25rem;
        border-bottom: 1px solid #e8e8e8;
    }

    .summary-label {
        color: #666;
        font-weight: 500;
        font-size: 0.95rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }

    .summary-value {
        color: #1a1a1a;
        font-weight: 600;
        font-size: 1.1rem;
        letter-spacing: -0.01em;
    }

    .summary-total {
        font-size: 1.5rem;
        font-weight: 700;
        color: #1a1a1a;
    }

    .summary-divider {
        height: 2px;
        background: linear-gradient(90deg, transparent, #e8e8e8, transparent);
        margin: 2rem 0;
    }

    /* Action Buttons */
    .checkout-btn {
        width: 100%;
        padding: 1.5rem 2.5rem;
        background: #1a1a1a;
        color: white;
        border: none;
        border-radius: 0;
        font-size: 0.95rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        font-family: 'Inter', sans-serif;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        position: relative;
        overflow: hidden;
        box-shadow: 0 8px 32px rgba(26, 26, 26, 0.2);
    }

    .checkout-btn:hover {
        background: #000;
        transform: translateY(-3px);
        box-shadow: 0 16px 48px rgba(26, 26, 26, 0.35);
    }

    .back-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        padding: 1.25rem 2rem;
        background: transparent;
        color: #1a1a1a;
        text-decoration: none;
        border-radius: 0;
        border: 2px solid #1a1a1a;
        font-weight: 500;
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        text-align: center;
        width: 100%;
        font-family: 'Inter', sans-serif;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        font-size: 0.85rem;
        cursor: pointer;
    }

    .back-btn:hover {
        background: #1a1a1a;
        color: white;
        transform: translateY(-2px);
    }

    /* Promo Code Styles */
    .promo-input-group {
        display: flex;
        gap: 10px;
    }

    .promo-input {
        flex: 1;
        padding: 12px 16px;
        border: 2px solid #e8e8e8;
        border-radius: 0;
        font-size: 14px;
        font-family: 'Inter', sans-serif;
        background: #fafafa;
        transition: all 0.3s ease;
    }

    .promo-input:focus {
        outline: none;
        border-color: #1a1a1a;
        background: white;
    }

    .apply-promo-btn {
        padding: 12px 24px;
        background: #27ae60;
        color: white;
        border: none;
        border-radius: 0;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        transition: all 0.3s ease;
    }

    .apply-promo-btn:hover {
        background: #219a52;
    }

    .checkout-right-column {
        display: flex;
        flex-direction: column;
        gap: 25px;
    }

    /* Responsive Design */
    @media (max-width: 992px) {
        .checkout-layout {
            grid-template-columns: 1fr;
        }
    }
`;

export default CheckOut;