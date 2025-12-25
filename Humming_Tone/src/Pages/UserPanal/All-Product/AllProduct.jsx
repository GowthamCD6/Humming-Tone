import React, { useState, useEffect } from 'react';
import demoImage from '../../../assets/demo.jpeg';
import UserFooter from '../../../components/User-Footer-Card/UserFooter';
import './AllProduct.css';
import { getGenderOptions, getCategoryOptionsForGender } from '../../../utils/siteContentStore';

// Sample products - will be replaced with API data later
const AllProductPage = ({ onViewDetails = () => {} }) => {
  const [selectedGender, setSelectedGender] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [products, setProducts] = useState([]); // Initialize with an empty array for fetched products

  // States for errors and loading
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const genderOptions = ['All Gender', ...getGenderOptions()];
  const categoryOptions = selectedGender === 'All' ? ['All Categories'] : getCategoryOptionsForGender(selectedGender);

  // Fetch products from API
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/admin/fetch_products');
      const data = await response.json();
      
      // Process the API data to match your required product structure
      const formattedProducts = data.map(product => ({
        id: product.id,
        name: product.name,
        brand: product.brand,
        price: parseFloat(product.weight), // You can replace this with the actual price field if available
        image: product.image_path, // Assuming image_path is the field for the product image
        category: product.gender, // Replace with the correct field
      }));

      setProducts(formattedProducts);  // Set the fetched products in state
    } catch (error) {
      setError('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  // Fetch products when component mounts
  useEffect(() => {
    fetchProducts();
  }, []); // Empty dependency array to only run once when the component mounts

  const handleApplyFilters = () => {
    console.log('Applying filters:', { selectedGender, selectedCategory });
  };

  const handleClearAll = () => {
    setSelectedGender('All');
    setSelectedCategory('All Categories');
  };

  const handleViewAll = () => {
    fetchProducts();  // Reload products when "View All" is clicked
  };

  // Product Card Component
  const ProductCard = ({ product }) => (
    <div className="all-products-product-card">
      <div className="all-products-product-image-container">
        <img 
          src={product.image || demoImage} 
          alt={product.name} 
          className="all-products-product-img"
          onError={(e) => { e.target.src = 'https://via.placeholder.com/400x500?text=Product+Image' }}
        />
        <div className="all-products-product-hover-overlay">
          <button
            className="all-products-view-details-btn"
            onClick={() => onViewDetails(product)}
          >
            VIEW DETAILS
          </button>
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

      {/* Products Section */}
      {loading ? (
        <p>Loading products...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
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
      )}

      {/* Footer */}
      <UserFooter />
    </div>
  );
};

export default AllProductPage;
