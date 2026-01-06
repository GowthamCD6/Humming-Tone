import React, { useState, useEffect } from 'react';
import UserFooter from '../../../components/User-Footer-Card/UserFooter';
import './Children\'s.css';
import { getGenderOptions, getCategoryOptionsForGender } from '../../../utils/siteContentStore';
import axios from 'axios';  // Import axios
import { Link } from 'react-router-dom';

const Children = ({ onViewDetails = () => {} }) => {
  const [selectedGender, setSelectedGender] = useState('Children');  // Default to 'Children'
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [products, setProducts] = useState([]);  // Set products to empty initially

  const genderOptions = getGenderOptions();
  const categoryOptions = getCategoryOptionsForGender(selectedGender);

  // Fetch products from the API when the gender or category changes
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/user/fetch_products?gender=children`);
        const fetchedProducts = response.data.map(product => ({
          ...product,
          price: parseFloat(product.price),  // Ensure price is a float
          // Ensure the full image URL is used from the backend
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
  };

  const handleClearAll = () => {
    setSelectedGender('Children');
    setSelectedCategory('All Categories');
  };

  const handleViewAll = () => {
    console.log('View all products');
    setProducts([]);  // Reset products if needed
  };

  // Product Card Component
  const ProductCard = ({ product }) => (
    <div className="childrens-product-card">
      <div className="childrens-product-image-container">
        {/* Render the exact image from the backend */}
        <img 
          src={product.image || 'https://via.placeholder.com/400x500?text=Product+Image'} 
          alt={product.name} 
          className="childrens-product-img"
          onError={(e) => { e.target.src = 'https://via.placeholder.com/400x500?text=Product+Image' }}  // Fallback for missing images
        />
        <div className="childrens-product-hover-overlay">
          <Link  className="all-products-view-details-btn" to={`/usertab/details/${product.id}`}>VIEW DETAILS</Link>
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
          <Link className="childrens-view-all-button" to="/usertab/all-products">VIEW ALL PRODUCTS</Link>
        </div>
      )}
      
      {/* Footer */}
      <UserFooter />
    </div>
  );
};

export default Children;
