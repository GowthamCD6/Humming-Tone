import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './CartPage.css';
import UserFooter from '../../../components/User-Footer-Card/UserFooter';

const PremiumCart = ({ onCheckout }) => {
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState([]);
  const [instructions, setInstructions] = useState('');
  const [alert, setAlert] = useState(null);
  const [removeModal, setRemoveModal] = useState({ show: false, itemId: null, itemName: '' });

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

  const showRemoveModal = (id, name) => {
    setRemoveModal({ show: true, itemId: id, itemName: name });
  };

  const confirmRemove = () => {
    const updatedCart = cartItems.filter(item => item.id !== removeModal.itemId);
    syncCart(updatedCart);
    setRemoveModal({ show: false, itemId: null, itemName: '' });
    setAlert({ type: 'success', message: 'Item removed from cart successfully.' });
    setTimeout(() => setAlert(null), 3000);
  };

  const cancelRemove = () => {
    setRemoveModal({ show: false, itemId: null, itemName: '' });
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
        <div className="userpanal-cart-page" style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
          <header className="userpanal-cart-header">
            <h1 className="userpanal-cart-page-title">Shopping Cart</h1>
            <span className="userpanal-cart-count">0 Items</span>
          </header>

          <div className="userpanal-cart-empty-cart">
            <h2>Your cart is empty</h2>
            <p>Looks like you haven't added anything to your cart yet. Start shopping to fill it up!</p>
            <button
              className="userpanal-cart-btn userpanal-cart-btn-primary"
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
      <div className="userpanal-cart-page" style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
        <header className="userpanal-cart-header">
          <h1 className="userpanal-cart-page-title">Shopping Cart</h1>
          <span className="userpanal-cart-count">
            {cartItems.length} {cartItems.length === 1 ? 'Item' : 'Items'}
          </span>
        </header>

        {alert && (
          <div className={`userpanal-cart-alert userpanal-cart-alert-${alert.type}`}>
            {alert.message}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '3rem' }}>
          <div>
            <div className="userpanal-cart-items">
              {cartItems.map(item => (
                <div key={`${item.id}-${item.size}`} className="userpanal-cart-item">
                  <div className="userpanal-cart-item-main">
                    <div className="userpanal-cart-item-left">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="userpanal-cart-item-image"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <div className="userpanal-cart-placeholder-image" style={{ display: 'none' }}>
                        No Image
                      </div>

                      <div className="userpanal-cart-item-info">
                        <h3 className="userpanal-cart-item-title">{item.name}</h3>
                        <div className="userpanal-cart-item-brand">{item.brand}</div>
                        <div className="userpanal-cart-item-meta">
                          <span>Size: {item.size}</span>
                          <span className="userpanal-cart-meta-separator"></span>
                          <span>Color: {item.color}</span>
                        </div>
                      </div>
                    </div>

                    <div className="userpanal-cart-item-right">
                      <div className="userpanal-cart-item-row userpanal-cart-top-row">
                        <div className="userpanal-cart-unit-price">₹ {item.price.toFixed(2)}</div>
                        <div className="userpanal-cart-controls-wrapper">
                          <div className="userpanal-cart-quantity-controls">
                            <button
                              className="userpanal-cart-qty-btn"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                            >
                              −
                            </button>
                            <span className="userpanal-cart-qty-value">{item.quantity}</span>
                            <button
                              className="userpanal-cart-qty-btn"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              disabled={item.stock > 0 && item.quantity >= item.stock}
                            >
                              +
                            </button>
                          </div>
                          <div className="userpanal-cart-availability-tag">
                            {item.stock > 0 ? `${item.stock} AVAILABLE` : 'OUT OF STOCK'}
                          </div>
                        </div>
                      </div>

                      <div className="userpanal-cart-item-row userpanal-cart-bottom-row">
                        <div className="userpanal-cart-total-price">
                          ₹ {(item.price * item.quantity).toFixed(2)}
                        </div>
                        <button
                          className="userpanal-cart-remove-action-btn"
                          onClick={() => showRemoveModal(item.id, item.name)}
                        >
                          REMOVE
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="userpanal-cart-actions">
              <Link className="userpanal-cart-btn userpanal-cart-btn-outline" to="/usertab/all-products">
                Continue Shopping
              </Link>
              <button className="userpanal-cart-btn userpanal-cart-btn-secondary" onClick={clearCart}>
                Clear Cart
              </button>
            </div>
          </div>

          <div>
            <div className="userpanal-cart-order-summary">
              <h2>Order Summary</h2>

              <div className="userpanal-cart-summary-row">
                <span className="userpanal-cart-summary-label">Subtotal</span>
                <span className="userpanal-cart-summary-value">₹ {calculateSubtotal().toFixed(2)}</span>
              </div>

              <div className="userpanal-cart-summary-divider"></div>

              <div className="userpanal-cart-summary-row">
                <span className="userpanal-cart-summary-label">Total</span>
                <span className="userpanal-cart-summary-total">₹ {calculateTotal().toFixed(2)}</span>
              </div>

              <div className="userpanal-cart-order-instructions">
                <label className="userpanal-cart-instructions-label" htmlFor="instructions">
                  Order Instructions (Optional)
                </label>
                <textarea
                  id="instructions"
                  className="userpanal-cart-instructions-textarea"
                  placeholder="Add delivery instructions, gift message, or special requests..."
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                />
              </div>

              <div className="userpanal-cart-checkout-section">
                <button
                  className="userpanal-cart-checkout-btn"
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

      {/* Remove Confirmation Modal */}
      {removeModal.show && (
        <div className="userpanal-cart-remove-modal-overlay" onClick={cancelRemove}>
          <div className="userpanal-cart-remove-modal" onClick={(e) => e.stopPropagation()}>
            <div className="userpanal-cart-remove-modal-header">
              <h3>Remove Item</h3>
            </div>
            <div className="userpanal-cart-remove-modal-body">
              <p>Are you sure you want to remove <strong>{removeModal.itemName}</strong> from your cart?</p>
            </div>
            <div className="userpanal-cart-remove-modal-footer">
              <button className="userpanal-cart-modal-btn userpanal-cart-modal-btn-cancel" onClick={cancelRemove}>
                Cancel
              </button>
              <button className="userpanal-cart-modal-btn userpanal-cart-modal-btn-confirm" onClick={confirmRemove}>
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      <UserFooter />
    </>
  );
};

export default PremiumCart;