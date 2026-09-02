import React from 'react';
import { Link } from 'react-router-dom';
import { getImageUrl } from '../../utils/apiConfig';
import './ProductCard.css';

export const ProductCard = ({ product, fallbackCategory = 'ATELIER COLLECTION' }) => {
  if (!product) return null;

  const imageUrl = product.image || (product.image_path ? getImageUrl(product.image_path) : '');
  const price = typeof product.price === 'number' ? product.price : parseFloat(product.price) || 0;
  const formattedPrice = `₹${price.toLocaleString('en-IN')}`;
  const category = product.category || product.brand || fallbackCategory;

  return (
    <div className="luxury-product-card">
      <div className="luxury-product-image-container">
        <img
          src={imageUrl}
          alt={product.name}
          className="luxury-product-img"
          onError={(e) => {
            e.target.onerror = null;
            e.target.style.opacity = '0.4';
          }}
        />
        <div className="all-products-product-hover-overlay">
          <Link
            to={`/usertab/details/${product.id}`}
            className="all-products-view-details-btn"
          >
            VIEW DETAILS
          </Link>
        </div>
      </div>
      <div className="luxury-product-meta">
        <span className="luxury-product-category">{category}</span>
        <h3 className="luxury-product-title">
          <Link
            to={`/usertab/details/${product.id}`}
            className="luxury-product-title-link"
          >
            {product.name}
          </Link>
        </h3>
        <p className="luxury-product-price">{formattedPrice}</p>
      </div>
    </div>
  );
};

export default ProductCard;
