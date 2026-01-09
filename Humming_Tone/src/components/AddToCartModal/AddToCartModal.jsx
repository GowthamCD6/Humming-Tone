import React from 'react';
import { useNavigate } from 'react-router-dom';
import './AddToCartModal.css';

const AddToCartModal = ({ isOpen, onClose, productData }) => {
  const navigate = useNavigate();

  if (!isOpen || !productData) return null;

  const handleViewCart = () => {
    onClose();
    navigate('/cart');
  };

  const handleContinueShopping = () => {
    onClose();
  };

  return (
    <div className="add-to-cart-modal-overlay" onClick={onClose}>
      <div className="add-to-cart-modal-content" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">Item Added to Cart!</h2>
        <p className="modal-subtitle">
          Your item has been successfully added to your shopping cart.
        </p>

        <div className="cart-item-display">
          <div className="cart-item-border"></div>
          
          <div className="cart-item-info">
            <div className="cart-item-image">
              <img src={productData.image} alt={productData.name} />
            </div>

            <div className="cart-item-details">
              <h3 className="item-name">{productData.name}</h3>
              
              <div className="item-meta">
                <p className="item-size">
                  Size: <span>{productData.size}</span>
                </p>
                <p className="item-quantity">
                  Quantity: <span>{productData.quantity}</span>
                </p>
                <p className="item-price">
                  Price: <span>₹{productData.price.toFixed(2)}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button 
            className="view-cart-btn" 
            onClick={handleViewCart}
          >
            VIEW CART
          </button>
          <button 
            className="continue-shopping-btn" 
            onClick={handleContinueShopping}
          >
            CONTINUE SHOPPING
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddToCartModal;