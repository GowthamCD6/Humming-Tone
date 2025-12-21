import React, { useState } from 'react';
import demoImage from '../../../assets/demo.jpeg';
import UserFooter from '../../../components/User-Footer-Card/UserFooter';
import './Children\'s.css';

// Sample products - will be replaced with API data later
const sampleProducts = [
  { 
    id: 1, 
    name: "Kids Graphic Tee", 
    brand: "FASHION & MORE", 
    price: 449.00, 
    image: "demo" 
  },
  { 
    id: 2, 
    name: "Denim Shorts", 
    brand: "FASHION & MORE", 
    price: 599.00, 
    image: "demo" 
  },
  { 
    id: 3, 
    name: "Hooded Jacket", 
    brand: "FASHION & MORE", 
    price: 999.00, 
    image: "demo" 
  },
  { 
    id: 4, 
    name: "Casual Sneakers", 
    brand: "FASHION & MORE", 
    price: 799.00, 
    image: "demo" 
  },
];

const CollectionPage = () => {
  const [selectedGender, setSelectedGender] = useState('Children');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [products, setProducts] = useState(sampleProducts); // Set sample products

  const genderOptions = ['Men', 'Children', 'Baby', 'Sports', 'Customize'];
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
    setSelectedGender('Children');
    setSelectedCategory('All Categories');
  };

  const handleViewAll = () => {
    console.log('View all products');
    setProducts(sampleProducts);
  };

  // Product Card Component
  const ProductCard = ({ product }) => (
    <div className="childrens-product-card">
      <div className="childrens-product-image-container">
        <img 
          src={product.image === "demo" ? demoImage : product.image} 
          alt={product.name} 
          className="childrens-product-img"
          onError={(e) => { e.target.src = 'https://via.placeholder.com/400x500?text=Product+Image' }}
        />
        <div className="childrens-product-hover-overlay">
          <button className="childrens-view-details-btn">VIEW DETAILS</button>
        </div>
      </div>
      <div className="childrens-product-details">
        <h3 className="childrens-product-title">{product.name}</h3>
        <p className="childrens-product-brand">{product.brand}</p>
        <p className="childrens-product-price">₹{product.price.toFixed(2)}</p>
      </div>
    </div>
  );

  return (
    <div className="childrens-collection-page">
      {/* Header Section */}
      <div className="childrens-header">
        <h1 className="childrens-title">Our Collection</h1>
        <p className="childrens-item-count">{products.length} ITEMS FOUND</p>
      </div>

      <div className="childrens-divider"></div>

      {/* Filter Section */}
      <div className="childrens-filter-container">
        <h2 className="childrens-filter-title">Refine Your Selection</h2>
        
        <div className="childrens-filter-row">
          {/* Gender Dropdown */}
          <div className="childrens-filter-group">
            <label className="childrens-filter-label">GENDER</label>
            <div className="childrens-select-wrapper">
              <select 
                className="childrens-select"
                value={selectedGender}
                onChange={(e) => setSelectedGender(e.target.value)}
              >
                {genderOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              <span className="childrens-select-arrow">▼</span>
            </div>
          </div>

          {/* Category Dropdown */}
          <div className="childrens-filter-group">
            <label className="childrens-filter-label">CATEGORY</label>
            <div className="childrens-select-wrapper">
              <select 
                className="childrens-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categoryOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              <span className="childrens-select-arrow">▼</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="childrens-button-group">
            <button 
              className="childrens-apply-button"
              onClick={handleApplyFilters}
            >
              APPLY FILTERS
            </button>
            <button 
              className="childrens-clear-button"
              onClick={handleClearAll}
            >
              CLEAR ALL
            </button>
          </div>
        </div>
      </div>

      {/* Products Section - Conditional Rendering */}
      {products.length > 0 ? (
        <div className="childrens-products-section">
          <div className="childrens-section-intro">
            <h2 className="childrens-section-heading">Children's Collection</h2>
            <div className="childrens-heading-accent"></div>
            <p className="childrens-section-description">Explore our curated collection of premium children's wear</p>
          </div>
          
          <div className="childrens-product-grid">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      ) : (
        <div className="childrens-no-products-container">
          <h2 className="childrens-no-products-title">No Products Found</h2>
          <p className="childrens-no-products-text">
            Try adjusting your filters or browse our complete<br />collection.
          </p>
          <button 
            className="childrens-view-all-button"
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