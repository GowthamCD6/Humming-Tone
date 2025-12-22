import React, { useState } from 'react';

const PremiumCart = () => {
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

  const calculateTax = () => {
    return calculateSubtotal() * 0.08;
  };

  const calculateShipping = () => {
    return calculateSubtotal() > 200 ? 0 : 15.99;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax() + calculateShipping();
  };

  const hasOutOfStock = cartItems.some(item => item.stock === 0);

  const handleCheckout = () => {
    if (hasOutOfStock) {
      setAlert({ type: 'error', message: 'Please remove out-of-stock items before checkout.' });
      setTimeout(() => setAlert(null), 3000);
    } else {
      alert('Proceeding to checkout...');
    }
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

      {hasOutOfStock && (
        <div className="warning-message">
          <h3>⚠️ Items Unavailable</h3>
          <p>Some items in your cart are currently out of stock. Please remove them to proceed with checkout.</p>
          <ul>
            {cartItems.filter(item => item.stock === 0).map(item => (
              <li key={item.id}>{item.name}</li>
            ))}
          </ul>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '3rem' }}>
        <div>
          <div className="cart-items">
            {cartItems.map(item => (
              <div key={item.id} className={`cart-item ${item.stock === 0 ? 'out-of-stock' : ''}`}>
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

                <div className="cart-item-details">
                  <div className="cart-item-brand">{item.brand}</div>
                  <h3>{item.name}</h3>
                  <div className="size-color-info">
                    <span>Size: {item.size}</span>
                    <span>Color: {item.color}</span>
                  </div>
                </div>

                <div className="cart-item-price">
                  ${item.price.toFixed(2)}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                  <div className="quantity-controls">
                    <button 
                      className="quantity-btn"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1 || item.stock === 0}
                    >
                      −
                    </button>
                    <input 
                      type="number" 
                      className="quantity-input"
                      value={item.quantity}
                      onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                      disabled={item.stock === 0}
                      min="1"
                      max={item.stock}
                    />
                    <button 
                      className="quantity-btn"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={item.quantity >= item.stock || item.stock === 0}
                    >
                      +
                    </button>
                  </div>
                  <div className={`stock-info ${item.stock === 0 ? 'out-of-stock' : 'in-stock'}`}>
                    {item.stock === 0 ? 'Out of Stock' : `${item.stock} in stock`}
                  </div>
                </div>

                <div className="cart-item-total">
                  ${(item.price * item.quantity).toFixed(2)}
                </div>

                <button 
                  className="remove-btn"
                  onClick={() => removeItem(item.id)}
                >
                  Remove
                </button>
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

            <div className="summary-row">
              <span className="summary-label">Tax (8%)</span>
              <span className="summary-value">${calculateTax().toFixed(2)}</span>
            </div>

            <div className="summary-row">
              <span className="summary-label">Shipping</span>
              <span className="summary-value">
                {calculateShipping() === 0 ? 'FREE' : `$${calculateShipping().toFixed(2)}`}
              </span>
            </div>

            {calculateSubtotal() > 200 && (
              <div style={{ 
                background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', 
                padding: '1rem', 
                margin: '1rem 0',
                borderLeft: '3px solid #22c55e',
                fontSize: '0.9rem',
                color: '#166534',
                fontWeight: '500'
              }}>
                🎉 You've qualified for free shipping!
              </div>
            )}

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

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Inter', sans-serif;
    background: #fafafa;
    color: #1a1a1a;
    line-height: 1.6;
  }

  /* Cart Header */
  .cart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 4rem;
    padding: 3rem 0;
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
    margin: 0;
    font-weight: 300;
    letter-spacing: -0.03em;
    position: relative;
  }

  .cart-count {
    color: #666;
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
    display: grid;
    grid-template-columns: 100px 1fr auto auto auto auto;
    gap: 2rem;
    padding: 2.5rem;
    border-bottom: 1px solid #f5f5f5;
    align-items: center;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    background: white;
  }

  .cart-item::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    width: 3px;
    height: 100%;
    background: #1a1a1a;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .cart-item:hover::before {
    opacity: 1;
  }

  .cart-item:last-child {
    border-bottom: none;
  }

  .cart-item.out-of-stock {
    background: #fafafa;
    opacity: 0.7;
  }

  .cart-item.out-of-stock::before {
    background: #e74c3c;
  }

  .cart-item:hover {
    background: #fafafa;
  }

  /* Product Image */
  .cart-item-image {
    width: 100px;
    height: 100px;
    object-fit: cover;
    border-radius: 0;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
    transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    filter: grayscale(0.1);
  }

  .cart-item:hover .cart-item-image {
    transform: scale(1.05);
    filter: grayscale(0);
  }

  .placeholder-image {
    width: 100px;
    height: 100px;
    background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #bbb;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    font-weight: 500;
  }

  /* Product Details */
  .cart-item-details {
    text-align: left;
    display: flex;
    flex-direction: column;
    justify-content: center;
    height: 100%;
  }

  .cart-item-details h3 {
    font-size: 1.2rem;
    font-weight: 500;
    color: #1a1a1a;
    margin-bottom: 0.5rem;
    line-height: 1.3;
    letter-spacing: -0.01em;
    transition: color 0.3s ease;
  }

  .cart-item:hover .cart-item-details h3 {
    color: #666;
  }

  .cart-item-brand {
    font-weight: 500;
    color: #666;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-size: 0.8rem;
    margin-bottom: 0.25rem;
  }

  .size-color-info {
    display: flex;
    gap: 1rem;
    margin-top: 0.5rem;
    flex-wrap: wrap;
  }

  .size-color-info span {
    font-size: 0.85rem;
    color: #666;
    font-weight: 500;
  }

  .cart-item-price {
    font-size: 1.15rem;
    font-weight: 600;
    color: #1a1a1a;
    text-align: center;
    letter-spacing: -0.01em;
  }

  /* Quantity Controls */
  .quantity-controls {
    display: inline-flex;
    align-items: center;
    border: 2px solid #e8e8e8;
    border-radius: 0;
    overflow: hidden;
    background: white;
    transition: border-color 0.3s ease;
  }

  .quantity-controls:hover {
    border-color: #bbb;
  }

  .quantity-btn {
    width: 44px;
    height: 44px;
    border: none;
    background: #fafafa;
    cursor: pointer;
    font-weight: 600;
    color: #1a1a1a;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    font-size: 1.2rem;
    font-family: 'Inter', sans-serif;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .quantity-btn:hover:not(:disabled) {
    background: #1a1a1a;
    color: white;
  }

  .quantity-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  .quantity-input {
    width: 70px;
    text-align: center;
    padding: 0.75rem;
    border: none;
    border-left: 1px solid #e8e8e8;
    border-right: 1px solid #e8e8e8;
    font-size: 1rem;
    font-weight: 600;
    color: #1a1a1a;
    background: white;
    font-family: 'Inter', sans-serif;
    letter-spacing: -0.01em;
  }

  .stock-info {
    font-size: 0.8rem;
    margin-top: 0.75rem;
    text-align: center;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-weight: 500;
  }

  .stock-info.in-stock {
    color: #27ae60;
  }

  .stock-info.out-of-stock {
    color: #e74c3c;
    font-weight: 600;
  }

  .cart-item-total {
    font-size: 1.4rem;
    font-weight: 700;
    color: #1a1a1a;
    text-align: center;
    letter-spacing: -0.02em;
  }

  /* Remove Button */
  .remove-btn {
    background: transparent;
    color: #e74c3c;
    border: 2px solid #e74c3c;
    padding: 0.75rem 1.5rem;
    border-radius: 0;
    cursor: pointer;
    font-size: 0.85rem;
    font-weight: 500;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    font-family: 'Inter', sans-serif;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    position: relative;
    overflow: hidden;
  }

  .remove-btn::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: rgba(231, 76, 60, 0.1);
    transform: translate(-50%, -50%);
    transition: width 0.5s, height 0.5s;
  }

  .remove-btn:hover::before {
    width: 300px;
    height: 300px;
  }

  .remove-btn:hover {
    background: #e74c3c;
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(231, 76, 60, 0.3);
  }

  /* Cart Actions */
  .cart-actions {
    display: flex;
    gap: 1rem;
    margin-bottom: 2rem;
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

  .btn::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: rgba(255,255,255,0.2);
    transform: translate(-50%, -50%);
    transition: width 0.6s, height 0.6s;
  }

  .btn:hover::before {
    width: 400px;
    height: 400px;
  }

  .btn-primary {
    background: #1a1a1a;
    color: white;
    box-shadow: 0 4px 16px rgba(26, 26, 26, 0.2);
  }

  .btn-primary:hover {
    background: #000;
    transform: translateY(-3px);
    box-shadow: 0 12px 32px rgba(26, 26, 26, 0.3);
  }

  .btn-secondary {
    background: #1a1a1a;
    color: white;
    box-shadow: 0 4px 16px rgba(26, 26, 26, 0.2);
  }

  .btn-secondary:hover {
    background: #000;
    transform: translateY(-3px);
    box-shadow: 0 12px 32px rgba(26, 26, 26, 0.3);
  }

  .btn-outline {
    background: transparent;
    color: #1a1a1a;
    border: 2px solid #1a1a1a;
  }

  .btn-outline::before {
    background: rgba(26,26,26,0.1);
  }

  .btn-outline:hover {
    background: #1a1a1a;
    color: white;
    transform: translateY(-3px);
    box-shadow: 0 8px 24px rgba(26, 26, 26, 0.2);
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
    font-size: 2rem;
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
    font-size: 1.5rem;
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
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
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
    margin-top: 2.5rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .checkout-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 1.5rem 3rem;
    background: #1a1a1a;
    color: white;
    border: none;
    border-radius: 0;
    text-decoration: none;
    font-weight: 500;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    cursor: pointer;
    font-family: 'Inter', sans-serif;
    font-size: 0.95rem;
    width: 100%;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    position: relative;
    overflow: hidden;
    box-shadow: 0 8px 32px rgba(26, 26, 26, 0.2);
  }

  .checkout-btn::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: rgba(255,255,255,0.2);
    transform: translate(-50%, -50%);
    transition: width 0.6s, height 0.6s;
  }

  .checkout-btn:hover::before {
    width: 500px;
    height: 500px;
  }

  .checkout-btn:enabled:hover {
    background: #000;
    transform: translateY(-3px);
    box-shadow: 0 16px 48px rgba(26, 26, 26, 0.35);
  }

  .checkout-btn:disabled {
    background: #bbb;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
    opacity: 0.6;
  }

  /* Warning Message */
  .warning-message {
    background: linear-gradient(135deg, #fff8f0 0%, #fff3e6 100%);
    color: #856404;
    padding: 2rem;
    margin: 2rem 0;
    border: 1px solid #ffeaa7;
    border-radius: 0;
    border-left: 4px solid #f39c12;
    animation: slideInDown 0.4s ease-out;
  }

  @keyframes slideInDown {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .warning-message h3 {
    margin-top: 0;
    color: #856404;
    font-size: 1.2rem;
    margin-bottom: 1rem;
    font-weight: 600;
    font-family: 'Inter', sans-serif;
    letter-spacing: -0.01em;
  }

  .warning-message p {
    margin: 0.75rem 0;
    line-height: 1.6;
  }

  .warning-message ul {
    margin: 1rem 0;
    padding-left: 1.5rem;
  }

  .warning-message li {
    margin-bottom: 0.5rem;
    line-height: 1.5;
  }

  /* Alert Messages */
  .alert {
    padding: 1.5rem 2rem;
    border-radius: 0;
    margin-bottom: 2.5rem;
    border-left: 4px solid;
    animation: slideInDown 0.4s ease-out;
    font-weight: 500;
  }

  .alert-success {
    background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
    color: #166534;
    border-color: #22c55e;
  }

  .alert-error {
    background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
    color: #991b1b;
    border-color: #ef4444;
  }

  /* Responsive Design */
  @media (max-width: 1400px) {
    .cart-item {
      grid-template-columns: 100px 1fr auto auto;
      gap: 1.5rem;
    }
    
    .cart-item > *:nth-child(n+5) {
      grid-column: 1 / -1;
      justify-self: start;
      margin-top: 1rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      flex-wrap: wrap;
    }
  }

  @media (max-width: 1200px) {
    .page-title {
      font-size: 3rem;
    }
    
    .cart-item {
      padding: 2rem;
    }
  }

  @media (max-width: 992px) {
    .page-title {
      font-size: 2.5rem;
    }
    
    .cart-header {
      flex-direction: column;
      gap: 1.5rem;
      align-items: flex-start;
      padding: 2rem 0;
      margin-bottom: 3rem;
    }
    
    .cart-item {
      grid-template-columns: 100px 1fr auto auto;
      gap: 1.5rem;
      padding: 2rem;
    }
    
    .cart-item-image {
      width: 100px;
      height: 100px;
    }
    
    .cart-item > *:nth-child(n+3) {
      grid-column: 1 / -1;
      justify-self: start;
      margin-top: 0.75rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      flex-wrap: wrap;
    }
  }

  @media (max-width: 768px) {
    .page-title {
      font-size: 2.2rem;
    }
    
    .cart-header {
      padding: 1.5rem 0;
      margin-bottom: 2.5rem;
    }
    
    .cart-item {
      grid-template-columns: 80px 1fr;
      padding: 1.5rem;
      gap: 1.25rem;
    }
    
    .cart-item-image {
      width: 80px;
      height: 80px;
    }
    
    .placeholder-image {
      width: 80px;
      height: 80px;
    }
    
    .cart-item-details {
      min-height: 80px;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    
    .cart-item-details h3 {
      font-size: 1rem;
      margin-bottom: 0.3rem;
      line-height: 1.2;
    }
    
    .cart-item-brand {
      font-size: 0.75rem;
      margin-bottom: 0.2rem;
    }
    
    .size-color-info {
      gap: 0.5rem;
      margin-top: 0.3rem;
    }
    
    .size-color-info span {
      font-size: 0.75rem;
      line-height: 1.2;
    }
    
    .cart-item-price {
      font-size: 1rem;
    }
    
    .cart-item-total {
      font-size: 1.1rem;
    }
    
    .quantity-controls {
      transform: scale(0.9);
    }
    
    .quantity-btn {
      width: 36px;
      height: 36px;
      font-size: 1rem;
    }
    
    .quantity-input {
      width: 50px;
      padding: 0.5rem;
      font-size: 0.9rem;
    }
    
    .stock-info {
      font-size: 0.7rem;
      margin-top: 0.5rem;
    }
    
    .remove-btn {
      padding: 0.5rem 1rem;
      font-size: 0.75rem;
    }
    
    .cart-actions {
      flex-direction: column;
      gap: 0.75rem;
    }
    
    .btn {
      width: 100%;
      padding: 14px 36px;
      font-size: 0.85rem;
    }
    
    .order-summary {
      padding: 2rem;
    }
    
    .order-summary h2 {
      font-size: 1.8rem;
    }

    .checkout-section {
      gap: 0.75rem;
    }
  }

  @media (max-width: 576px) {
    .page-title {
      font-size: 1.8rem;
    }
    
    .cart-header {
      padding: 1rem 0;
      margin-bottom: 2rem;
    }
    
    .cart-count {
      font-size: 0.9rem;
    }
    
    .cart-item {
      grid-template-columns: 70px 1fr;
      padding: 1.25rem;
      gap: 1rem;
    }
    
    .cart-item-image {
      width: 70px;
      height: 70px;
    }
    
    .placeholder-image {
      width: 70px;
      height: 70px;
    }
    
    .cart-item-details h3 {
      font-size: 0.95rem;
    }
    
    .cart-item-brand {
      font-size: 0.7rem;
    }
    
    .size-color-info {
      flex-direction: row;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    
    .size-color-info span {
      font-size: 0.7rem;
    }
    
    .cart-item > *:nth-child(n+3) {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 0.5rem;
      margin-top: 0.5rem;
    }
    
    .quantity-controls {
      transform: scale(0.85);
      margin-left: -5px;
    }
    
    .empty-cart {
      padding: 4rem 1.5rem;
    }
    
    .empty-cart h2 {
      font-size: 2rem;
    }
    
    .empty-cart p {
      font-size: 1rem;
    }
    
    .order-summary {
      padding: 1.5rem;
    }
    
    .order-summary h2 {
      font-size: 1.6rem;
    }
    
    .checkout-btn {
      padding: 1.25rem 2rem;
      font-size: 0.85rem;
    }
    
    .btn {
      padding: 12px 32px;
      font-size: 0.85rem;
    }
    
    .warning-message {
      padding: 1.5rem;
    }
  }

  @media (min-width: 769px) {
    .checkout-section {
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      gap: 1.5rem;
    }
    
    .checkout-btn {
      width: auto;
      min-width: 280px;
      flex-shrink: 0;
      order: 2;
    }
    
    .cart-actions {
      order: 1;
      margin-bottom: 0;
    }
    
    .cart-actions .btn {
      width: auto;
    }
    
    .cart-item {
      grid-template-columns: 100px 1fr auto auto auto auto;
      gap: 2rem;
      padding: 2.5rem;
    }
    
    .cart-item-image {
      width: 100px;
      height: 100px;
    }
    
    .placeholder-image {
      width: 100px;
      height: 100px;
    }
  }

  /* Performance Optimizations */
  .cart-item-image,
  .btn,
  .checkout-btn {
    will-change: transform;
  }

  /* Reduced Motion */
  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
`;

export default PremiumCart;