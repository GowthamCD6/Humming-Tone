import React from 'react';
import { useNavigate } from 'react-router-dom';
import './AddToCartModal.css';

const AddToCartModal = ({ isOpen, onClose, productData }) => {
  const navigate = useNavigate();

  if (!isOpen || !productData) return null;

  const handleViewCart = () => {
    onClose();
    navigate('/usertab/cart');
  };

  const handleContinueShopping = () => {
    onClose();
  };

  return (
    <div className="product-modal-overlay" onClick={onClose}>
      <div className="product-modal-content" onClick={(e) => e.stopPropagation()}>
        <h2 className="product-modal-title">Item Added to Cart!</h2>
        <p className="product-modal-subtitle">
          Your item has been successfully added to your shopping cart.
        </p>

        <div className="product-modal-item-display">
          <div className="product-modal-item-border"></div>
          
          <div className="product-modal-item-info">
            <div className="product-modal-item-image">
              <img src={productData.image} alt={productData.name} />
            </div>

            <div className="product-modal-item-details">
              <h3 className="product-modal-item-name">{productData.name}</h3>
              
              <div className="product-modal-item-meta">
                <p className="product-modal-meta-row">
                  Size: <span>{productData.size}</span>
                </p>
                <p className="product-modal-meta-row">
                  Quantity: <span>{productData.quantity}</span>
                </p>
                <p className="product-modal-meta-row">
                  Price: <span>₹{productData.price.toFixed(2)}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="product-modal-actions">
          <button 
            className="product-modal-btn product-modal-btn-primary" 
            onClick={handleViewCart}
          >
            VIEW CART
          </button>
          <button 
            className="product-modal-btn product-modal-btn-secondary" 
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