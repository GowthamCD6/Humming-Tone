import React, { useState, useEffect } from 'react';
import UserFooter from '../../../components/User-Footer-Card/UserFooter';
import LottieLoader from '../../../components/LottieLoader/LottieLoader';
import './Baby.css';
import { getGenderOptions } from '../../../utils/siteContentStore';
import axios from 'axios';  // Import axios
import { Link } from 'react-router-dom';
import { API_BASE_URL, getImageUrl } from '../../../utils/apiConfig';

const Baby = ({ onViewDetails: _onViewDetails = () => {} }) => {
  const [selectedGender, setSelectedGender] = useState('Baby');  // Default to 'Baby'
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [products, setProducts] = useState([]);  // Empty array for "No Products Found" state
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryOptions, setCategoryOptions] = useState(['All Categories']);

  const genderOptions = getGenderOptions();

  // Fetch categories dynamically
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        let url = `${API_BASE_URL}/user/fetch_categories?gender=babies`;
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
        const response = await axios.get(`${API_BASE_URL}/user/fetch_products?gender=babies`);
        const fetchedProducts = response.data.map(product => ({
          ...product,
          price: parseFloat(product.price),  // Ensure price is a float
          image: product.image_path ? getImageUrl(product.image_path) : '',
        }));
        setProducts(fetchedProducts);  // Update the state with fetched products
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
    setSelectedGender('Baby');
    setSelectedCategory('All Categories');
    setProducts(allProducts);
  };

  // Product Card Component
  const ProductCard = ({ product }) => (
    <div className="baby-product-card">
      <div className="baby-product-image-container">
        <img 
          src={product.image} 
          alt={product.name} 
          className="baby-product-img"
          onError={(e) => {
            e.target.onerror = null;
            e.target.style.opacity = '0.5';
          }}
        />
        <div className="baby-product-hover-overlay">
          <Link  className="baby-view-details-btn" to={`/usertab/details/${product.id}`}>VIEW DETAILS</Link>
        </div>
      </div>
      <div className="baby-product-details">
        <h3 className="baby-product-title">{product.name}</h3>
        <p className="baby-product-brand">{product.brand || 'HummingTone'}</p>
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
                disabled
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
      {loading ? (
        <div className="baby-products-section">
          <div className="baby-section-intro">
            <h2 className="baby-section-heading">Baby's Collection</h2>
            <div className="baby-heading-accent"></div>
            <p className="baby-section-description">Explore our curated collection of premium products</p>
          </div>
          <LottieLoader size={160} message="Loading baby collection..." />
        </div>
      ) : products.length > 0 ? (
        <div className="baby-products-section">
          <div className="baby-section-intro">
            <h2 className="baby-section-heading">Baby's Collection</h2>
            <div className="baby-heading-accent"></div>
            <p className="baby-section-description">Explore our curated collection of premium products</p>
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
          <Link className="baby-view-all-button" to="/usertab/all-products">VIEW ALL PRODUCTS</Link>
        </div>
      )}
      
      {/* Footer */}
      <UserFooter />
    </div>
  );
};

export default Baby;
