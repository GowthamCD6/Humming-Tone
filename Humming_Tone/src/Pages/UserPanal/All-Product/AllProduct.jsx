import React, { useState } from 'react';
import demoImage from '../../../assets/demo.jpeg';
import UserFooter from '../../../components/User-Footer-Card/UserFooter';
import './AllProduct.css';

// Sample products - will be replaced with API data later
const sampleProducts = [
  { 
    id: 1, 
    name: "Classic Polo Shirt", 
    brand: "FASHION & MORE", 
    price: 599.00, 
    image: "demo",
    category: "Men"
  },
  { 
    id: 2, 
    name: "Kids Graphic Tee", 
    brand: "FASHION & MORE", 
    price: 449.00, 
    image: "demo",
    category: "Children"
  },
  { 
    id: 3, 
    name: "Baby Romper Set", 
    brand: "FASHION & MORE", 
    price: 399.00, 
    image: "demo",
    category: "Baby"
  },
  { 
    id: 4, 
    name: "Performance Running Shoes", 
    brand: "FASHION & MORE", 
    price: 1299.00, 
    image: "demo",
    category: "Sports"
  },
  { 
    id: 5, 
    name: "Slim Fit Jeans", 
    brand: "FASHION & MORE", 
    price: 899.00, 
    image: "demo",
    category: "Men"
  },
  { 
    id: 6, 
    name: "Denim Shorts", 
    brand: "FASHION & MORE", 
    price: 599.00, 
    image: "demo",
    category: "Children"
  },
  { 
    id: 7, 
    name: "Soft Cotton Onesie", 
    brand: "FASHION & MORE", 
    price: 349.00, 
    image: "demo",
    category: "Baby"
  },
  { 
    id: 8, 
    name: "Athletic Track Pants", 
    brand: "FASHION & MORE", 
    price: 899.00, 
    image: "demo",
    category: "Sports"
  },
  { 
    id: 9, 
    name: "Casual Blazer", 
    brand: "FASHION & MORE", 
    price: 1299.00, 
    image: "demo",
    category: "Men"
  },
];

const AllProductPage = () => {
  const [selectedGender, setSelectedGender] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [products, setProducts] = useState(sampleProducts); // Set sample products

  const genderOptions = ['All Gender', 'Men', 'Children', 'Baby', 'Sports', 'Customize'];
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
    setSelectedGender('All');
    setSelectedCategory('All Categories');
  };

  const handleViewAll = () => {
    console.log('View all products');
    setProducts(sampleProducts);
  };

  // Product Card Component
  const ProductCard = ({ product }) => (
    <div className="all-products-product-card">
      <div className="all-products-product-image-container">
        <img 
          src={product.image === "demo" ? demoImage : product.image} 
          alt={product.name} 
          className="all-products-product-img"
          onError={(e) => { e.target.src = 'https://via.placeholder.com/400x500?text=Product+Image' }}
        />
        <div className="all-products-product-hover-overlay">
          <button className="all-products-view-details-btn">VIEW DETAILS</button>
        </div>
      </div>
      <div className="all-products-product-details">
        <h3 className="all-products-product-title">{product.name}</h3>
        <p className="all-products-product-brand">{product.brand}</p>
        <p className="all-products-product-price">₹{product.price.toFixed(2)}</p>
      </div>
    </div>
  );

  return (
    <div className="all-products-collection-page">
      {/* Header Section */}
      <div className="all-products-header">
        <h1 className="all-products-title">Our Collection</h1>
        <p className="all-products-item-count">{products.length} ITEMS FOUND</p>
      </div>

      <div className="all-products-divider"></div>

      {/* Filter Section */}
      <div className="all-products-filter-container">
        <h2 className="all-products-filter-title">Refine Your Selection</h2>
        
        <div className="all-products-filter-row">
          {/* Gender Dropdown */}
          <div className="all-products-filter-group">
            <label className="all-products-filter-label">GENDER</label>
            <div className="all-products-select-wrapper">
              <select 
                className="all-products-select"
                value={selectedGender}
                onChange={(e) => setSelectedGender(e.target.value)}
              >
                {genderOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              <span className="all-products-select-arrow">▼</span>
            </div>
          </div>

          {/* Category Dropdown */}
          <div className="all-products-filter-group">
            <label className="all-products-filter-label">CATEGORY</label>
            <div className="all-products-select-wrapper">
              <select 
                className="all-products-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categoryOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              <span className="all-products-select-arrow">▼</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="all-products-button-group">
            <button 
              className="all-products-apply-button"
              onClick={handleApplyFilters}
            >
              APPLY FILTERS
            </button>
            <button 
              className="all-products-clear-button"
              onClick={handleClearAll}
            >
              CLEAR ALL
            </button>
          </div>
        </div>
      </div>

      {/* Products Section - Conditional Rendering */}
      {products.length > 0 ? (
        <div className="all-products-products-section">
          <div className="all-products-section-intro">
            <h2 className="all-products-section-heading">All Products</h2>
            <div className="all-products-heading-accent"></div>
            <p className="all-products-section-description">Explore our complete collection of premium products</p>
          </div>
          
          <div className="all-products-product-grid">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      ) : (
        <div className="all-products-no-products-container">
          <h2 className="all-products-no-products-title">No Products Found</h2>
          <p className="all-products-no-products-text">
            Try adjusting your filters or browse our complete<br />collection.
          </p>
          <button 
            className="all-products-view-all-button"
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

export default AllProductPage;