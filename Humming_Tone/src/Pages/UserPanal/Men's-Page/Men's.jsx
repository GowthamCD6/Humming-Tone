import React, { useState, useEffect } from 'react';
import demoImage from '../../../assets/demo.jpeg';
import UserFooter from '../../../components/User-Footer-Card/UserFooter';
import LottieLoader from '../../../components/LottieLoader/LottieLoader';
import './Mens.css';
import { getGenderOptions } from '../../../utils/siteContentStore';
import axios from 'axios';  // Import axios
import { Link } from 'react-router-dom';
import { API_BASE_URL, getImageUrl } from '../../../utils/apiConfig';

const Men = ({ onViewDetails: _onViewDetails = () => {} }) => {
  const [selectedGender, setSelectedGender] = useState('Men');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryOptions, setCategoryOptions] = useState(['All Categories']);

  const genderOptions = getGenderOptions();

  // Fetch categories dynamically
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        let url = `${API_BASE_URL}/user/fetch_categories`;
        if (selectedGender !== 'All' && selectedGender !== 'All Gender') {
           url += `?gender=${selectedGender}`;
        }
        const response = await axios.get(url);
        setCategoryOptions(['All Categories', ...response.data]);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, [selectedGender]);

  // Fetch products from the API when the gender or category changes
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/user/fetch_products?gender=${selectedGender.toLowerCase()}`);
        const fetchedProducts = response.data.map(product => ({
          ...product,
          price: parseFloat(product.price),  // Ensure price is a float
          image: getImageUrl(product.image_path),
        }));
        setProducts(fetchedProducts);
        setAllProducts(fetchedProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedGender]);  // Trigger API call when gender changes

  const handleApplyFilters = () => {
    let filtered = [...allProducts];
    if (selectedCategory !== 'All Categories') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }
    setProducts(filtered);
  };

  const handleClearAll = () => {
    setSelectedGender('Men');
    setSelectedCategory('All Categories');
    setProducts(allProducts);
  };

  // Product Card Component
  const ProductCard = ({ product }) => (
    <div className="mens-product-card">
      <div className="mens-product-image-container">
        <img 
          src={product.image} 
          alt={product.name} 
          className="mens-product-img"
          onError={(e) => {
            e.target.onerror = null;
            e.target.style.opacity = '0.5';
          }}
        />
        <div className="mens-product-hover-overlay">
          <Link  className="mens-view-details-btn" to={`/usertab/details/${product.id}`}>VIEW DETAILS</Link>
        </div>
      </div>
      <div className="mens-product-details">
        <h3 className="mens-product-title">{product.name}</h3>
        <p className="mens-product-brand">{product.brand || 'HummingTone'}</p>
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
                disabled
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
      {loading ? (
        <div className="mens-products-section">
          <div className="mens-section-intro">
            <h2 className="mens-section-heading">Men's Collection</h2>
            <div className="mens-heading-accent"></div>
            <p className="mens-section-description">Explore our curated collection of premium products</p>
          </div>
          <LottieLoader size={160} message="Loading men's collection..." />
        </div>
      ) : products.length > 0 ? (
        <div className="mens-products-section">
          <div className="mens-section-intro">
            <h2 className="mens-section-heading">Men's Collection</h2>
            <div className="mens-heading-accent"></div>
            <p className="mens-section-description">Explore our curated collection of premium products</p>
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
          <Link className="mens-view-all-button" to="/usertab/all-products">VIEW ALL PRODUCTS</Link>
        </div>
      )}
      
      {/* Footer */}
      <UserFooter />
    </div>
  );
};

export default Men;
