import React, { useState, useEffect } from 'react';
import UserFooter from '../../../components/User-Footer-Card/UserFooter';
import './Sports.css';
import { getGenderOptions, getCategoryOptionsForGender } from '../../../utils/siteContentStore';
import axios from 'axios';  // Import axios

const sports = ({ onViewDetails = () => {} }) => {
  const [selectedGender, setSelectedGender] = useState('Sports');  // Default to 'Sports'
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [products, setProducts] = useState([]);  // Empty array for "No Products Found" state

  const genderOptions = getGenderOptions();
  const categoryOptions = getCategoryOptionsForGender(selectedGender);

  // Fetch products from the API when the gender or category changes
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/user/fetch_products?gender=sports`);
        const fetchedProducts = response.data.map(product => ({
          ...product,
          price: parseFloat(product.price),  // Ensure price is a float
          // Correct the image URL if image_path is not available
          image: product.image_path ? `http://localhost:5000/${product.image_path}` : '',  // Use image path from backend
        }));
        setProducts(fetchedProducts);  // Update the state with fetched products
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, [selectedGender]);  // Trigger API call when gender changes

  const handleApplyFilters = () => {
    console.log('Applying filters:', { selectedGender, selectedCategory });
    // You can add logic here to filter products based on category
  };

  const handleClearAll = () => {
    setSelectedGender('Sports');
    setSelectedCategory('All Categories');
    setProducts([]); // Reset products when filters are cleared
  };

  const handleViewAll = () => {
    console.log('View all products');
    setProducts([]);  // Clear current product list if needed
  };

  // Product Card Component
  const ProductCard = ({ product }) => (
    <div className="sports-product-card">
      <div className="sports-product-image-container">
        {/* Render the exact image from the backend */}
        <img 
          src={product.image || 'https://via.placeholder.com/400x500?text=Product+Image'} 
          alt={product.name} 
          className="sports-product-img"
          onError={(e) => { e.target.src = 'https://via.placeholder.com/400x500?text=Product+Image' }}  // Fallback for missing images
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

export default sports;
