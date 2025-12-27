import React, { useState } from 'react';

const PremiumCart = ({ onCheckout }) => {
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: 'Wireless Noise-Cancelling Headphones',
      brand: 'AudioTech',
      price: 299.99,
      quantity: 1,
      size: 'One Size',
      color: 'Matte Black',
      stock: 15,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop'
    },
    {
      id: 2,
      name: 'Premium Leather Wallet',
      brand: 'Luxe Goods',
      price: 89.99,
      quantity: 2,
      size: 'Standard',
      color: 'Cognac Brown',
      stock: 8,
      image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=400&h=400&fit=crop'
    },
    {
      id: 3,
      name: 'Minimalist Watch',
      brand: 'Timeless Co',
      price: 449.99,
      quantity: 1,
      size: '42mm',
      color: 'Silver',
      stock: 0,
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop'
    },
    {
      id: 4,
      name: 'Designer Sunglasses',
      brand: 'Vogue Vision',
      price: 199.99,
      quantity: 1,
      size: 'Medium',
      color: 'Tortoise Shell',
      stock: 12,
      image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=400&fit=crop'
    }
  ]);

  const [instructions, setInstructions] = useState('');
  const [alert, setAlert] = useState(null);

  const updateQuantity = (id, newQuantity) => {
    const item = cartItems.find(item => item.id === id);
    if (newQuantity > item.stock && item.stock > 0) {
      setAlert({ type: 'error', message: `Only ${item.stock} items available in stock.` });
      setTimeout(() => setAlert(null), 3000);
      return;
    }

    if (newQuantity < 1) return;

    setCartItems(cartItems.map(item =>
      item.id === id ? { ...item, quantity: newQuantity } : item
    ));
  };

  const removeItem = (id) => {
    setCartItems(cartItems.filter(item => item.id !== id));
    setAlert({ type: 'success', message: 'Item removed from cart successfully.' });
    setTimeout(() => setAlert(null), 3000);
  };

  const clearCart = () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      setCartItems([]);
      setAlert({ type: 'success', message: 'Cart cleared successfully.' });
      setTimeout(() => setAlert(null), 3000);
    }
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal();
  };

  const hasOutOfStock = cartItems.every(item => item.stock === 0);

  const handleCheckout = () => {
    if (onCheckout) onCheckout();
  };

  if (cartItems.length === 0) {
    return (
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
        <style>{`
          ${CSS_STYLES}
        `}</style>

        <header className="cart-header">
          <h1 className="page-title">Shopping Cart</h1>
          <span className="cart-count">0 Items</span>
        </header>

        <div className="empty-cart">
          <h2>Your cart is empty</h2>
          <p>Looks like you haven't added anything to your cart yet. Start shopping to fill it up!</p>
          <button className="btn btn-primary" onClick={() => alert('Redirecting to shop...')}>
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
      <style>{`
        ${CSS_STYLES}
      `}</style>

      <header className="cart-header">
        <h1 className="page-title">Shopping Cart</h1>
        <span className="cart-count">{cartItems.length} {cartItems.length === 1 ? 'Item' : 'Items'}</span>
      </header>

      {alert && (
        <div className={`alert alert-${alert.type}`}>
          {alert.message}
        </div>
      )}


      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '3rem' }}>
        <div>
          <div className="cart-items">
            {cartItems.map(item => (
              <div key={item.id} className="cart-item">
                <div className="cart-item-main">
                  {/* Left Side: Image and Details */}
                  <div className="cart-item-left">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="cart-item-image"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="placeholder-image" style={{ display: 'none' }}>
                      No Image
                    </div>

                    <div className="cart-item-info">
                      <h3 className="item-title">{item.name}</h3>
                      <div className="item-brand">{item.brand}</div>
                      <div className="item-meta">
                        <span>Size: {item.size}</span>
                        <span className="meta-separator"></span>
                        <span>Color: {item.color}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Side: Price and Controls */}
                  <div className="cart-item-right">
                    <div className="item-row top-row">
                      <div className="unit-price">₹{item.price.toFixed(2)}</div>
                      <div className="controls-wrapper">
                        <div className="quantity-controls">
                          <button
                            className="qty-btn"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            −
                          </button>
                          <span className="qty-value">{item.quantity}</span>
                          <button
                            className="qty-btn"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={item.stock > 0 && item.quantity >= item.stock}
                          >
                            +
                          </button>
                        </div>
                        <div className="availability-tag">{item.stock > 0 ? `${item.stock} AVAILABLE` : 'OUT OF STOCK'}</div>
                      </div>
                    </div>

                    <div className="item-row bottom-row">
                      <div className="total-price">₹{(item.price * item.quantity).toFixed(2)}</div>
                      <button
                        className="remove-action-btn"
                        onClick={() => removeItem(item.id)}
                      >
                        REMOVE
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-actions">
            <button className="btn btn-outline" onClick={() => alert('Redirecting to shop...')}>
              Continue Shopping
            </button>
            <button className="btn btn-secondary" onClick={clearCart}>
              Clear Cart
            </button>
          </div>
        </div>

        <div>
          <div className="order-summary">
            <h2>Order Summary</h2>

            <div className="summary-row">
              <span className="summary-label">Subtotal</span>
              <span className="summary-value">${calculateSubtotal().toFixed(2)}</span>
            </div>

            <div className="summary-divider"></div>

            <div className="summary-row">
              <span className="summary-label">Total</span>
              <span className="summary-total">${calculateTotal().toFixed(2)}</span>
            </div>

            <div className="order-instructions">
              <label className="instructions-label" htmlFor="instructions">
                Order Instructions (Optional)
              </label>
              <textarea
                id="instructions"
                className="instructions-textarea"
                placeholder="Add delivery instructions, gift message, or special requests..."
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
              />
            </div>

            <div className="checkout-section">
              <button
                className="checkout-btn"
                disabled={hasOutOfStock}
                onClick={handleCheckout}
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CSS_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap');

  /* Modern Minimalist Cart - Premium E-Commerce */

  /* Page Header */
  .cart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      padding: 0.5rem 0 0.75rem 0;
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
      font-size: 3.4rem;
      color: #1a1a1a;
      margin: 0;
      font-weight: 300;
      letter-spacing: -0.03em;
      position: relative;
      margin-top: -10px;
  }

  .cart-count {
      color: #777;
      font-size: 1rem;
      font-weight: 400;
      letter-spacing: 0.05em;
      text-transform: uppercase;
  }

  /* Empty Cart State */
  .empty-cart {
      text-align: center;
      padding: 6rem 2rem;
      animation: fadeIn 0.6s ease-out;
  }

  @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
  }

  .empty-cart h2 {
      font-family: 'Playfair Display', serif;
      font-size: 2.5rem;
      color: #1a1a1a;
      margin-bottom: 1.5rem;
      font-weight: 300;
      letter-spacing: -0.02em;
  }

  .empty-cart p {
      font-size: 1.15rem;
      margin-bottom: 3rem;
      max-width: 500px;
      margin-left: auto;
      margin-right: auto;
      color: #666;
      line-height: 1.8;
      font-weight: 300;
  }

  /* Cart Items Container */
  .cart-items {
      background: white;
      border-radius: 0;
      overflow: hidden;
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
      margin-bottom: 3rem;
      border: 1px solid #e8e8e8;
      animation: fadeIn 0.6s ease-out 0.2s both;
  }

  .cart-item {
      padding: 2.5rem;
      border-bottom: 2px solid #f5f5f5;
      background: white;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .cart-item:last-child {
      border-bottom: none;
  }

  .cart-item-main {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 3rem;
  }

  .cart-item-left {
      display: flex;
      align-items: center;
      gap: 2rem;
      flex: 1;
  }

  .cart-item-image {
      width: 140px;
      height: 140px;
      object-fit: cover;
      border-radius: 0;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
      filter: grayscale(0.1);
      transition: all 0.3s ease;
  }

  .cart-item-left:hover .cart-item-image {
      filter: grayscale(0);
      transform: scale(1.02);
  }

  .cart-item-info {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      text-align: left;
  }

  .item-title {
      font-size: 1.4rem;
      font-weight: 500;
      color: #1a1a1a;
      margin-bottom: 0.5rem;
      font-family: 'Playfair Display', serif;
      letter-spacing: -0.01em;
  }

  .item-brand {
      font-weight: 500;
      color: #999;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      font-size: 0.8rem;
      margin-bottom: 0.75rem;
  }

  .item-meta {
      display: flex;
      gap: 1rem;
      align-items: center;
      font-size: 0.9rem;
      color: #666;
  }

  .meta-separator {
      width: 1px;
      height: 12px;
      background: #ddd;
  }

  .cart-item-right {
      display: grid;
      grid-template-columns: 150px 180px;
      gap: 1.5rem 2.5rem;
      align-items: center;
  }

  .unit-price {
      font-size: 1.3rem;
      font-weight: 500;
      color: #1a1a1a;
      text-align: left;
  }

  .total-price {
      font-size: 1.6rem;
      font-weight: 700;
      color: #000;
      text-align: left;
  }

  .controls-wrapper {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 0.5rem;
  }

  .quantity-controls {
      display: flex;
      border: 1px solid #ddd;
      border-radius: 0;
      overflow: hidden;
      background: white;
      width: 100%;
  }

  .qty-btn {
      flex: 1;
      height: 44px;
      border: none;
      background: #f9f9f9;
      cursor: pointer;
      font-weight: 500;
      color: #1a1a1a;
      font-size: 1.2rem;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.3s ease;
  }

  .qty-btn:hover:not(:disabled) {
      background: #f0f0f0;
  }

  .qty-btn:disabled {
      color: #ddd;
      cursor: not-allowed;
  }

  .qty-value {
      width: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 1.1rem;
      border-left: 1px solid #ddd;
      border-right: 1px solid #ddd;
      color: #111;
  }

  .availability-tag {
      font-size: 0.75rem;
      font-weight: 600;
      color: #27ae60;
      text-transform: uppercase;
      letter-spacing: 0.05em;
  }

  .remove-action-btn {
      width: 100%;
      height: 44px;
      background: transparent;
      color: #e74c3c;
      border: 1px solid #e74c3c;
      padding: 0;
      border-radius: 0;
      cursor: pointer;
      font-size: 0.85rem;
      font-weight: 600;
      transition: all 0.3s ease;
      letter-spacing: 0.1em;
      display: flex;
      align-items: center;
      justify-content: center;
  }

  .remove-action-btn:hover {
      background: #e74c3c;
      color: white;
  }

  /* Adjust internal row layout */
  .item-row {
      display: contents; /* Allows grid alignment */
  }

  /* Cart Actions */
  .cart-actions {
      display: flex;
      gap: 1rem;
      margin-top: 2rem;
      flex-wrap: wrap;
  }

  .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 16px 48px;
      border-radius: 0;
      text-decoration: none;
      font-weight: 500;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      border: none;
      cursor: pointer;
      font-family: 'Inter', sans-serif;
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      position: relative;
      overflow: hidden;
  }

  .btn-primary {
      background: #1a1a1a;
      color: white;
  }

  .btn-outline {
      background: transparent;
      color: #1a1a1a;
      border: 2px solid #1a1a1a;
  }

  .btn-secondary {
      background: #1a1a1a;
      color: white;
  }

  /* Order Summary */
  .order-summary {
      background: white;
      padding: 3rem;
      border-radius: 0;
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
      border: 1px solid #e8e8e8;
      animation: fadeIn 0.6s ease-out 0.3s both;
      position: relative;
  }

  .order-summary::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, #1a1a1a 0%, #666 50%, #1a1a1a 100%);
  }

  .order-summary h2 {
      font-family: 'Playfair Display', serif;
      font-size: 2.2rem;
      color: #1a1a1a;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 2px solid #f5f5f5;
      font-weight: 300;
      letter-spacing: -0.02em;
  }

  .summary-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.25rem;
      padding-bottom: 1.25rem;
      border-bottom: 1px solid #f5f5f5;
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
      font-size: 1.8rem;
      font-weight: 700;
      color: #1a1a1a;
  }

  .summary-divider {
      height: 2px;
      background: linear-gradient(90deg, transparent, #e8e8e8, transparent);
      margin: 2rem 0;
  }

  /* Order Instructions */
  .order-instructions {
      margin: 2.5rem 0;
  }

  .instructions-label {
      display: block;
      font-weight: 500;
      color: #1a1a1a;
      margin-bottom: 1rem;
      font-size: 0.95rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
  }

  .instructions-textarea {
      width: 100%;
      padding: 1.25rem;
      border: 2px solid #e8e8e8;
      border-radius: 0;
      font-family: 'Inter', sans-serif;
      font-size: 0.95rem;
      resize: vertical;
      min-height: 100px;
      transition: all 0.3s ease;
      background: #fafafa;
      color: #1a1a1a;
      line-height: 1.6;
  }

  .instructions-textarea:hover {
      border-color: #bbb;
      background: white;
  }

  .instructions-textarea:focus {
      outline: none;
      border-color: #1a1a1a;
      background: white;
      box-shadow: 0 0 0 4px rgba(26, 26, 26, 0.05);
  }

  .instructions-textarea::placeholder {
      color: #bbb;
  }

  /* Checkout Section */
  .checkout-section {
      margin-top: 3rem;
      display: flex;
      justify-content: flex-start;
  }

  .checkout-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 1.25rem 3rem;
      background: #1a1a1a;
      color: white;
      border: none;
      border-radius: 0;
      text-decoration: none;
      font-weight: 500;
      transition: all 0.4s ease;
      cursor: pointer;
      font-family: 'Inter', sans-serif;
      font-size: 0.9rem;
      width: fit-content;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      box-shadow: 0 8px 32px rgba(26, 26, 26, 0.2);
  }

  .checkout-btn:enabled:hover {
      background: #000;
      transform: translateY(-3px);
      box-shadow: 0 16px 48px rgba(26, 26, 26, 0.35);
  }

  /* Responsive Design */
  @media (max-width: 992px) {
      .cart-item-main {
          flex-direction: column;
          align-items: flex-start;
          gap: 2rem;
      }
      .cart-item-right {
          grid-template-columns: 1fr 1fr;
          width: 100%;
      }
  }

  @media (max-width: 576px) {
      .page-title { font-size: 2.2rem; }
      .cart-item-left { flex-direction: column; align-items: flex-start; }
      .cart-item-image { width: 100%; height: auto; }
  }
`;

export default PremiumCart;