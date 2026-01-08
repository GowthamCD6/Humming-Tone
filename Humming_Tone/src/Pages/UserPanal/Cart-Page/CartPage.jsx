import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './CartPage.css';
import UserFooter from '../../../components/User-Footer-Card/UserFooter';

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
      <>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
          <header className="cart-header">
            <h1 className="page-title">Shopping Cart</h1>
            <span className="cart-count">0 Items</span>
          </header>

          <div className="empty-cart">
            <h2>Your cart is empty</h2>
            <p>Looks like you haven't added anything to your cart yet. Start shopping to fill it up!</p>
            <button className="btn btn-primary" onClick={() => Navigate("")}>
              Continue Shopping
            </button>
          </div>
        </div>
        <UserFooter />
      </>
    );
  }

  return (
    <>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
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
            <Link className='btn btn-outline' to="/usertab/all-products">Continue Shopping</Link>
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
      <UserFooter />
    </>
  );
};

export default PremiumCart;