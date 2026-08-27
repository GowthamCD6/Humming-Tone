import React from 'react';
import './ProductSkeleton.css';

export const ProductCardSkeleton = () => {
  return (
    <div className="product-skeleton-card luxury-skeleton-card">
      <div className="product-skeleton-image-wrapper luxury-skeleton-image-wrap">
        <div className="skeleton-box skeleton-shimmer product-skeleton-image" />
      </div>
      <div className="product-skeleton-details luxury-skeleton-details">
        <div className="skeleton-box skeleton-shimmer luxury-skeleton-category" />
        <div className="skeleton-box skeleton-shimmer luxury-skeleton-title" />
        <div className="skeleton-box skeleton-shimmer luxury-skeleton-price" />
      </div>
    </div>
  );
};

export const ProductGridSkeleton = ({ count = 4 }) => {
  return (
    <div className="product-skeleton-grid luxury-skeleton-grid">
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
};

export default ProductGridSkeleton;
