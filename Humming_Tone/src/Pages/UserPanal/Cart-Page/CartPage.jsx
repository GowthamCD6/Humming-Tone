import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './CartPage.css';
import UserFooter from '../../../components/User-Footer-Card/UserFooter';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AuthModal from '../../../components/AuthModal/AuthModal';
import { fetchSiteContent, getSiteContent } from '../../../utils/siteContentStore';

const PremiumCart = ({ onCheckout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [shippingFee, setShippingFee] = useState(() => {
    const cached = getSiteContent();
    return Number(cached?.shippingFee != null ? cached.shippingFee : (cached?.footer?.shippingFee || 0));
  });

  const [gstRate, setGstRate] = useState(() => {
    const cached = getSiteContent();
    return Number(cached?.gstRate != null ? cached.gstRate : (cached?.footer?.gstRate || 5));
  });

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


  const [cartItems, setCartItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('cart')) || [];
    } catch {
      return [];
    }
  });

  // Listen to live cart changes from other pages/modals
  useEffect(() => {
    const handleCartSync = () => {
      try {
        setCartItems(JSON.parse(localStorage.getItem('cart')) || []);
      } catch {
        setCartItems([]);
      }
    };
    window.addEventListener('cart:updated', handleCartSync);
    window.addEventListener('storage', handleCartSync);
    return () => {
      window.removeEventListener('cart:updated', handleCartSync);
      window.removeEventListener('storage', handleCartSync);
    };
  }, []);

  const [instructions, setInstructions] = useState('');
  const [alert, setAlert] = useState(null);
  const [removeModal, setRemoveModal] = useState({ show: false, itemKey: null, itemName: '' });
  const [clearCartModal, setClearCartModal] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  /* ================= SYNC CART TO LOCALSTORAGE ================= */
  const syncCart = (updatedCart) => {
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    window.dispatchEvent(new Event('cart:updated'));
  };

  const getItemKey = (item) => {
    return item.cartItemId || `${item.id}-${item.size || 'Standard'}-${item.color || 'Default'}`;
  };

  const updateQuantity = (itemKey, newQuantity) => {
    const item = cartItems.find(it => getItemKey(it) === itemKey || `${it.id}-${it.size}` === itemKey || it.id === itemKey);
    if (!item) return;

    if (newQuantity > item.stock && item.stock > 0) {
      setAlert({ type: 'error', message: `Only ${item.stock} items available in stock.` });
      setTimeout(() => setAlert(null), 3000);
      return;
    }

    if (newQuantity < 1) {
      showRemoveModal(itemKey, item.name);
      return;
    }

    const updatedCart = cartItems.map(it => {
      const match = getItemKey(it) === itemKey || `${it.id}-${it.size}` === itemKey || it.id === itemKey;
      return match ? { ...it, quantity: newQuantity } : it;
    });

    syncCart(updatedCart);
  };

  const showRemoveModal = (itemKey, name) => {
    setRemoveModal({ show: true, itemKey, itemName: name });
  };

  const confirmRemove = () => {
    const updatedCart = cartItems.filter(it => {
      const match = getItemKey(it) === removeModal.itemKey || 
                    `${it.id}-${it.size}` === removeModal.itemKey ||
                    String(it.id) === String(removeModal.itemKey);
      return !match;
    });
    syncCart(updatedCart);
    setRemoveModal({ show: false, itemKey: null, itemName: '' });
    setAlert({ type: 'success', message: 'Item removed from cart successfully.' });
    setTimeout(() => setAlert(null), 3000);
  };

  const cancelRemove = () => {
    setRemoveModal({ show: false, itemKey: null, itemName: '' });
  };

  const clearCart = () => {
    setClearCartModal(true);
  };

  const confirmClearCart = () => {
    syncCart([]);
    setClearCartModal(false);
    setAlert({ type: 'success', message: 'Cart cleared successfully.' });
    setTimeout(() => setAlert(null), 3000);
  };

  const cancelClearCart = () => {
    setClearCartModal(false);
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + (Number(item.price || 0) * (Number(item.quantity) || 1)), 0);
  };

  const calculateGST = () => {
    // Price is inclusive of GST: Included GST = Subtotal - (Subtotal / (1 + rate/100))
    const sub = calculateSubtotal();
    const rate = Number(gstRate) || 5;
    return sub - (sub / (1 + rate / 100));
  };

  const calculateTotal = () => {
    return calculateSubtotal() + (Number(shippingFee) || 0);
  };
  // simple

  const hasOutOfStock = cartItems.every(item => item.stock === 0);

  const handleCheckout = () => {
    const user = JSON.parse(localStorage.getItem('customerUser') || 'null');
    const token = localStorage.getItem('userToken');

    if (!user || !token || user?.email === 'guest@hummingtone.com') {
      setAuthModalOpen(true);
      return;
    }

    if (onCheckout) onCheckout();
    navigate('/usertab/checkout');
  };

  /* ================= EMPTY CART ================= */
  if (cartItems.length === 0 && !location.pathname.includes("checkout")) {

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
            <button
              className="userpanal-cart-btn userpanal-cart-btn-track"
              onClick={() => navigate('/usertab/track-order')}
            >
              <LocalShippingIcon style={{ fontSize: '1.1rem' }} />
              Track My Order
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
            {cartItems.reduce((sum, item) => sum + item.quantity, 0)} Items
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
              {cartItems.map(item => {
                const itemKey = getItemKey(item);
                return (
                <div key={itemKey} className="userpanal-cart-item">
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
                        <div className="userpanal-cart-unit-price">₹ {Number(item.price || 0).toFixed(2)}</div>
                        <div className="userpanal-cart-controls-wrapper">
                          <div className="userpanal-cart-quantity-controls">
                            <button
                              className="userpanal-cart-qty-btn"
                              onClick={() => updateQuantity(itemKey, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                            >
                              −
                            </button>
                            <span className="userpanal-cart-qty-value">{item.quantity}</span>
                            <button
                              className="userpanal-cart-qty-btn"
                              onClick={() => updateQuantity(itemKey, item.quantity + 1)}
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
                          ₹ {(Number(item.price || 0) * item.quantity).toFixed(2)}
                        </div>
                        <button
                          className="userpanal-cart-remove-action-btn"
                          onClick={() => showRemoveModal(itemKey, item.name)}
                        >
                          REMOVE
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
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

              <div className="userpanal-cart-summary-row">
                <span className="userpanal-cart-summary-label">Shipping</span>
                <span className="userpanal-cart-summary-value">
                  {Number(shippingFee) > 0 ? `₹ ${Number(shippingFee).toFixed(2)}` : 'FREE'}
                </span>
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
                <button
                  className="userpanal-cart-track-btn"
                  onClick={() => navigate('/usertab/track-order')}
                >
                  <LocalShippingIcon style={{ fontSize: '1rem' }} />
                  Track My Order
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

      {/* Clear Cart Confirmation Modal */}
      {clearCartModal && (
        <div className="userpanal-cart-remove-modal-overlay" onClick={cancelClearCart}>
          <div className="userpanal-cart-remove-modal" onClick={(e) => e.stopPropagation()}>
            <div className="userpanal-cart-remove-modal-header">
              <h3>Clear Cart</h3>
            </div>
            <div className="userpanal-cart-remove-modal-body">
              <p>Are you sure you want to clear all items from your cart?</p>
            </div>
            <div className="userpanal-cart-remove-modal-footer">
              <button className="userpanal-cart-modal-btn userpanal-cart-modal-btn-cancel" onClick={cancelClearCart}>
                Cancel
              </button>
              <button className="userpanal-cart-modal-btn userpanal-cart-modal-btn-confirm" onClick={confirmClearCart}>
                Clear Cart
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal for Mandatory Google Login */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onAuthSuccess={() => {
          setAuthModalOpen(false);
          navigate('/usertab/checkout');
        }}
      />

      <UserFooter />
    </>
  );
};

export default PremiumCart;