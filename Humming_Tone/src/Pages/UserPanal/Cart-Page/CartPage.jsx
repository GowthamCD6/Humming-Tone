import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './CartPage.css';
import UserFooter from '../../../components/User-Footer-Card/UserFooter';

const PremiumCart = ({ onCheckout }) => {
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState([]);
  const [instructions, setInstructions] = useState('');
  const [alert, setAlert] = useState(null);

  /* ================= LOAD CART FROM LOCALSTORAGE ================= */
  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    setCartItems(cart);
  }, []);

  /* ================= SYNC CART TO LOCALSTORAGE ================= */
  const syncCart = (updatedCart) => {
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const updateQuantity = (id, newQuantity) => {
    const item = cartItems.find(item => item.id === id);
    if (!item) return;

    if (newQuantity > item.stock && item.stock > 0) {
      setAlert({ type: 'error', message: `Only ${item.stock} items available in stock.` });
      setTimeout(() => setAlert(null), 3000);
      return;
    }

    if (newQuantity < 1) return;

    const updatedCart = cartItems.map(item =>
      item.id === id ? { ...item, quantity: newQuantity } : item
    );

    syncCart(updatedCart);
  };

  const removeItem = (id) => {
    const updatedCart = cartItems.filter(item => item.id !== id);
    syncCart(updatedCart);

    setAlert({ type: 'success', message: 'Item removed from cart successfully.' });
    setTimeout(() => setAlert(null), 3000);
  };

  const clearCart = () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      syncCart([]);
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

  /* ================= EMPTY CART ================= */
  if (cartItems.length === 0) {
    return (
      <>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
          <header className="cart-header">
            <h1 className="page-title">Shopping Cart</h1>
            <span className="cart-count">0 Items</span>
          </header>

          <div className="empty-cart">
            <h2>Your cart is empty</h2>
            <p>Looks like you haven't added anything to your cart yet. Start shopping to fill it up!</p>
            <button
              className="btn btn-primary"
              onClick={() => navigate('/usertab/all-products')}
            >
              Continue Shopping
            </button>
          </div>
        </div>
        <UserFooter />
      </>
    );
  }

  /* ================= CART PAGE ================= */
  return (
    <>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
        <header className="cart-header">
          <h1 className="page-title">Shopping Cart</h1>
          <span className="cart-count">
            {cartItems.length} {cartItems.length === 1 ? 'Item' : 'Items'}
          </span>
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
                <div key={`${item.id}-${item.size}`} className="cart-item">
                  <div className="cart-item-main">
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
                          <div className="availability-tag">
                            {item.stock > 0 ? `${item.stock} AVAILABLE` : 'OUT OF STOCK'}
                          </div>
                        </div>
                      </div>

                      <div className="item-row bottom-row">
                        <div className="total-price">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </div>
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
              <Link className="btn btn-outline" to="/usertab/all-products">
                Continue Shopping
              </Link>
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
                <span className="summary-value">₹{calculateSubtotal().toFixed(2)}</span>
              </div>

              <div className="summary-divider"></div>

              <div className="summary-row">
                <span className="summary-label">Total</span>
                <span className="summary-total">₹{calculateTotal().toFixed(2)}</span>
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

      <UserFooter />
    </>
  );
};

export default PremiumCart;