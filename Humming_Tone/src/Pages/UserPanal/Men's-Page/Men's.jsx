import React, { useState } from 'react';
import demoImage from '../../../assets/demo.jpeg';
import UserFooter from '../../../components/User-Footer-Card/UserFooter';
import './Mens.css';

// Sample products - will be replaced with API data later
const sampleProducts = [
  { 
    id: 1, 
    name: "Classic Polo Shirt", 
    brand: "FASHION & MORE", 
    price: 599.00, 
    image: "demo" 
  },
  { 
    id: 2, 
    name: "Slim Fit Jeans", 
    brand: "FASHION & MORE", 
    price: 899.00, 
    image: "demo" 
  },
  { 
    id: 3, 
    name: "Casual Blazer", 
    brand: "FASHION & MORE", 
    price: 1299.00, 
    image: "demo" 
  },
  { 
    id: 4, 
    name: "Cotton T-Shirt", 
    brand: "FASHION & MORE", 
    price: 399.00, 
    image: "demo" 
  },
];

const CollectionPage = ({ onViewDetails = () => {} }) => {
  const [selectedGender, setSelectedGender] = useState('Men');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [products, setProducts] = useState(sampleProducts); // Set sample products

  const genderOptions = ['Men', 'Children',  'Baby', 'Sports', 'Customize'];
  const categoryOptions = [
    'All Categories',
    'Shirts',
    'Pants',
    'Jackets',
    'Shoes',
    'Accessories'
  ];

  const handleApplyFilters = () => {
    console.log('Applying filters:', { selectedGender, selectedCategory });
  };

  const handleClearAll = () => {
    setSelectedGender('Men');
    setSelectedCategory('All Categories');
  };

  const handleViewAll = () => {
    console.log('View all products');
    setProducts(sampleProducts);
  };

  // Product Card Component
  const ProductCard = ({ product }) => (
    <div className="mens-product-card">
      <div className="mens-product-image-container">
        <img 
          src={product.image === "demo" ? demoImage : product.image} 
          alt={product.name} 
          className="mens-product-img"
          onError={(e) => { e.target.src = 'https://via.placeholder.com/400x500?text=Product+Image' }}
        />
        <div className="mens-product-hover-overlay">
          <button
            className="mens-view-details-btn"
            onClick={() => onViewDetails(product)}
          >
            VIEW DETAILS
          </button>
        </div>
      </div>
      <div className="mens-product-details">
        <h3 className="mens-product-title">{product.name}</h3>
        <p className="mens-product-brand">{product.brand}</p>
        <p className="mens-product-price">₹{product.price.toFixed(2)}</p>
      </div>
    </div>
  );

  return (
    <div className="mens-collection-page">
      {/* Header Section */}
      <div className="mens-header">
        <h1 className="mens-title">Our Collection</h1>
        <p className="mens-item-count">{products.length} ITEMS FOUND</p>
      </div>

      <div className="mens-divider"></div>

      {/* Filter Section */}
      <div className="mens-filter-container">
        <h2 className="mens-filter-title">Refine Your Selection</h2>
        
        <div className="mens-filter-row">
          {/* Gender Dropdown */}
          <div className="mens-filter-group">
            <label className="mens-filter-label">GENDER</label>
            <div className="mens-select-wrapper">
              <select 
                className="mens-select"
                value={selectedGender}
                onChange={(e) => setSelectedGender(e.target.value)}
              >
                {genderOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              <span className="mens-select-arrow">▼</span>
            </div>
          </div>

          {/* Category Dropdown */}
          <div className="mens-filter-group">
            <label className="mens-filter-label">CATEGORY</label>
            <div className="mens-select-wrapper">
              <select 
                className="mens-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categoryOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              <span className="mens-select-arrow">▼</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mens-button-group">
            <button 
              className="mens-apply-button"
              onClick={handleApplyFilters}
            >
              APPLY FILTERS
            </button>
            <button 
              className="mens-clear-button"
              onClick={handleClearAll}
            >
              CLEAR ALL
            </button>
          </div>
        </div>
      </div>

      {/* Products Section - Conditional Rendering */}
      {products.length > 0 ? (
        <div className="mens-products-section">
          <div className="mens-section-intro">
            <h2 className="mens-section-heading">Men's Collection</h2>
            <div className="mens-heading-accent"></div>
            <p className="mens-section-description">Explore our curated collection of premium men's wear</p>
          </div>
          
          <div className="mens-product-grid">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      ) : (
        <div className="mens-no-products-container">
          <h2 className="mens-no-products-title">No Products Found</h2>
          <p className="mens-no-products-text">
            Try adjusting your filters or browse our complete<br />collection.
          </p>
          <button 
            className="mens-view-all-button"
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