import React from 'react';
import './ProductSkeleton.css';

export const ProductCardSkeleton = () => {
  return (
    <div className="product-skeleton-card">
      <div className="product-skeleton-image-wrapper">
        <div className="skeleton-box skeleton-shimmer product-skeleton-image" />
      </div>
      <div className="product-skeleton-details">
        <div className="skeleton-box skeleton-shimmer product-skeleton-title" />
        <div className="skeleton-box skeleton-shimmer product-skeleton-brand" />
        <div className="skeleton-box skeleton-shimmer product-skeleton-price" />
      </div>
    </div>
  );
};

export const ProductGridSkeleton = ({ count = 6 }) => {
  return (
    <div className="product-skeleton-grid">
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
};

export default ProductGridSkeleton;
