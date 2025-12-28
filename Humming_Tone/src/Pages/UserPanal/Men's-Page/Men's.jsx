import React, { useState, useEffect } from 'react';
import demoImage from '../../../assets/demo.jpeg';
import UserFooter from '../../../components/User-Footer-Card/UserFooter';
import './Mens.css';
import { getGenderOptions, getCategoryOptionsForGender } from '../../../utils/siteContentStore';
import axios from 'axios';  // Import axios

const CollectionPage = ({ onViewDetails = () => {} }) => {
  const [selectedGender, setSelectedGender] = useState('Men');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [products, setProducts] = useState([]);  // Initialize as empty array

  const genderOptions = getGenderOptions();
  const categoryOptions = getCategoryOptionsForGender(selectedGender);

  // Fetch products from the API when the gender or category changes
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/user/fetch_products?gender=${selectedGender.toLowerCase()}`);
        const fetchedProducts = response.data.map(product => ({
          ...product,
          price: parseFloat(product.price),  // Ensure price is a float
          // Concatenate image path with base URL for correct image URL
          image: product.image_path ? `http://localhost:5000/${product.image_path}` : demoImage,  // Correct the image URL
        }));
        setProducts(fetchedProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, [selectedGender]);  // Trigger API call when gender changes

  const handleApplyFilters = () => {
    console.log('Applying filters:', { selectedGender, selectedCategory });
  };

  const handleClearAll = () => {
    setSelectedGender('Men');
    setSelectedCategory('All Categories');
  };

  const handleViewAll = () => {
    console.log('View all products');
    // If you want to display all products again (unfiltered)
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
          onError={(e) => { e.target.src = 'https://via.placeholder.com/400x500?text=Product+Image' }}  // Fallback for missing images
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
