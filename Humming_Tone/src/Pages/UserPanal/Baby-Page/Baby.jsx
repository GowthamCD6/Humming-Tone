import React, { useState } from 'react';
import demoImage from '../../../assets/demo.jpeg';
import UserFooter from '../../../components/User-Footer-Card/UserFooter';
import './Baby.css';

// Sample products - will be replaced with API data later
const sampleProducts = [
  { 
    id: 1, 
    name: "Baby Romper Set", 
    brand: "FASHION & MORE", 
    price: 399.00, 
    image: "demo" 
  },
  { 
    id: 2, 
    name: "Soft Cotton Onesie", 
    brand: "FASHION & MORE", 
    price: 349.00, 
    image: "demo" 
  },
  { 
    id: 3, 
    name: "Baby Booties", 
    brand: "FASHION & MORE", 
    price: 249.00, 
    image: "demo" 
  },
  { 
    id: 4, 
    name: "Cute Cap Set", 
    brand: "FASHION & MORE", 
    price: 299.00, 
    image: "demo" 
  },
];

const CollectionPage = () => {
  const [selectedGender, setSelectedGender] = useState('Baby');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [products, setProducts] = useState([]); // Empty array for "No Products Found" state

  const genderOptions = ['Men', 'Children', 'Baby', 'Sports', 'Customize'];
  const categoryOptions = [
    'All Categories',
    'Rompers',
    'Onesies',
    'Shoes',
    'Accessories',
    'Sets'
  ];

  const handleApplyFilters = () => {
    console.log('Applying filters:', { selectedGender, selectedCategory });
    // You can add logic here to filter products
  };

  const handleClearAll = () => {
    setSelectedGender('Baby');
    setSelectedCategory('All Categories');
    setProducts([]); // Reset to empty for demo
  };

  const handleViewAll = () => {
    console.log('View all products');
    setProducts(sampleProducts); // Load sample products when clicked
  };

  // Product Card Component
  const ProductCard = ({ product }) => (
    <div className="baby-product-card">
      <div className="baby-product-image-container">
        <img 
          src={product.image === "demo" ? demoImage : product.image} 
          alt={product.name} 
          className="baby-product-img"
          onError={(e) => { e.target.src = 'https://via.placeholder.com/400x500?text=Product+Image' }}
        />
        <div className="baby-product-hover-overlay">
          <button className="baby-view-details-btn">VIEW DETAILS</button>
        </div>
      </div>
      <div className="baby-product-details">
        <h3 className="baby-product-title">{product.name}</h3>
        <p className="baby-product-brand">{product.brand}</p>
        <p className="baby-product-price">₹{product.price.toFixed(2)}</p>
      </div>
    </div>
  );

  return (
    <div className="baby-collection-page">
      {/* Header Section */}
      <div className="baby-header">
        <h1 className="baby-title">Our Collection</h1>
        <p className="baby-item-count">{products.length} ITEMS FOUND</p>
      </div>

      <div className="baby-divider"></div>

      {/* Filter Section */}
      <div className="baby-filter-container">
        <h2 className="baby-filter-title">Refine Your Selection</h2>
        
        <div className="baby-filter-row">
          {/* Gender Dropdown */}
          <div className="baby-filter-group">
            <label className="baby-filter-label">GENDER</label>
            <div className="baby-select-wrapper">
              <select 
                className="baby-select"
                value={selectedGender}
                onChange={(e) => setSelectedGender(e.target.value)}
              >
                {genderOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              <span className="baby-select-arrow">▼</span>
            </div>
          </div>

          {/* Category Dropdown */}
          <div className="baby-filter-group">
            <label className="baby-filter-label">CATEGORY</label>
            <div className="baby-select-wrapper">
              <select 
                className="baby-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categoryOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              <span className="baby-select-arrow">▼</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="baby-button-group">
            <button 
              className="baby-apply-button"
              onClick={handleApplyFilters}
            >
              APPLY FILTERS
            </button>
            <button 
              className="baby-clear-button"
              onClick={handleClearAll}
            >
              CLEAR ALL
            </button>
          </div>
        </div>
      </div>

      {/* Products Section - Conditional Rendering */}
      {products.length > 0 ? (
        <div className="baby-products-section">
          <div className="baby-section-intro">
            <h2 className="baby-section-heading">Baby Collection</h2>
            <div className="baby-heading-accent"></div>
            <p className="baby-section-description">Explore our curated collection of premium baby wear</p>
          </div>
          
          <div className="baby-product-grid">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      ) : (
        <div className="baby-no-products-container">
          <h2 className="baby-no-products-title">No Products Found</h2>
          <p className="baby-no-products-text">
            Try adjusting your filters or browse our complete<br />collection.
          </p>
          <button 
            className="baby-view-all-button"
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