import React, { useState } from 'react';
import demoImage from '../../../assets/demo.jpeg';
import UserFooter from '../../../components/User-Footer-Card/UserFooter';
import './Sports.css';

// Sample products - will be replaced with API data later
const sampleProducts = [
  { 
    id: 1, 
    name: "Performance Running Shoes", 
    brand: "FASHION & MORE", 
    price: 1299.00, 
    image: "demo" 
  },
  { 
    id: 2, 
    name: "Athletic Track Pants", 
    brand: "FASHION & MORE", 
    price: 899.00, 
    image: "demo" 
  },
  { 
    id: 3, 
    name: "Sports Jacket", 
    brand: "FASHION & MORE", 
    price: 1599.00, 
    image: "demo" 
  },
  { 
    id: 4, 
    name: "Gym T-Shirt", 
    brand: "FASHION & MORE", 
    price: 499.00, 
    image: "demo" 
  },
];

const CollectionPage = ({ onViewDetails = () => {} }) => {
  const [selectedGender, setSelectedGender] = useState('Sports');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [products, setProducts] = useState(sampleProducts); // Set sample products

  const genderOptions = ['Men', 'Children', 'Baby', 'Sports', 'Customize'];
  const categoryOptions = [
    'All Categories',
    'Running',
    'Training',
    'Outdoor',
    'Shoes',
    'Accessories'
  ];

  const handleApplyFilters = () => {
    console.log('Applying filters:', { selectedGender, selectedCategory });
  };

  const handleClearAll = () => {
    setSelectedGender('Sports');
    setSelectedCategory('All Categories');
  };

  const handleViewAll = () => {
    console.log('View all products');
    setProducts(sampleProducts);
  };

  // Product Card Component
  const ProductCard = ({ product }) => (
    <div className="sports-product-card">
      <div className="sports-product-image-container">
        <img 
          src={product.image === "demo" ? demoImage : product.image} 
          alt={product.name} 
          className="sports-product-img"
          onError={(e) => { e.target.src = 'https://via.placeholder.com/400x500?text=Product+Image' }}
        />
        <div className="sports-product-hover-overlay">
          <button
            className="sports-view-details-btn"
            onClick={() => onViewDetails(product)}
          >
            VIEW DETAILS
          </button>
        </div>
      </div>
      <div className="sports-product-details">
        <h3 className="sports-product-title">{product.name}</h3>
        <p className="sports-product-brand">{product.brand}</p>
        <p className="sports-product-price">₹{product.price.toFixed(2)}</p>
      </div>
    </div>
  );

  return (
    <div className="sports-collection-page">
      {/* Header Section */}
      <div className="sports-header">
        <h1 className="sports-title">Our Collection</h1>
        <p className="sports-item-count">{products.length} ITEMS FOUND</p>
      </div>

      <div className="sports-divider"></div>

      {/* Filter Section */}
      <div className="sports-filter-container">
        <h2 className="sports-filter-title">Refine Your Selection</h2>
        
        <div className="sports-filter-row">
          {/* Gender Dropdown */}
          <div className="sports-filter-group">
            <label className="sports-filter-label">GENDER</label>
            <div className="sports-select-wrapper">
              <select 
                className="sports-select"
                value={selectedGender}
                onChange={(e) => setSelectedGender(e.target.value)}
              >
                {genderOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              <span className="sports-select-arrow">▼</span>
            </div>
          </div>

          {/* Category Dropdown */}
          <div className="sports-filter-group">
            <label className="sports-filter-label">CATEGORY</label>
            <div className="sports-select-wrapper">
              <select 
                className="sports-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categoryOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              <span className="sports-select-arrow">▼</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="sports-button-group">
            <button 
              className="sports-apply-button"
              onClick={handleApplyFilters}
            >
              APPLY FILTERS
            </button>
            <button 
              className="sports-clear-button"
              onClick={handleClearAll}
            >
              CLEAR ALL
            </button>
          </div>
        </div>
      </div>

      {/* Products Section - Conditional Rendering */}
      {products.length > 0 ? (
        <div className="sports-products-section">
          <div className="sports-section-intro">
            <h2 className="sports-section-heading">Sports Collection</h2>
            <div className="sports-heading-accent"></div>
            <p className="sports-section-description">Explore our curated collection of premium sports wear</p>
          </div>
          
          <div className="sports-product-grid">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      ) : (
        <div className="sports-no-products-container">
          <h2 className="sports-no-products-title">No Products Found</h2>
          <p className="sports-no-products-text">
            Try adjusting your filters or browse our complete<br />collection.
          </p>
          <button 
            className="sports-view-all-button"
            onClick={handleViewAll}
          >
            VIEW ALL PRODUCTS
          </button>
        </div>
      )}
      
      {/* Footer */}
      <UserFooter />
    </div>
  );
};

export default CollectionPage;