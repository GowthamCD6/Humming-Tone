import React, { useState, useEffect } from 'react';
import UserFooter from '../../../components/User-Footer-Card/UserFooter';
import LottieLoader from '../../../components/LottieLoader/LottieLoader';
import './Sports.css';
import { getGenderOptions } from '../../../utils/siteContentStore';
import axios from 'axios';  // Import axios
import { Link } from 'react-router-dom';
import { API_BASE_URL, getImageUrl } from '../../../utils/apiConfig';

const Sports = ({ onViewDetails: _onViewDetails = () => {} }) => {
  const [selectedGender, setSelectedGender] = useState('Sports');  // Default to 'Sports'
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
        let url = `${API_BASE_URL}/user/fetch_categories?gender=sports`;
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
        const response = await axios.get(`${API_BASE_URL}/user/fetch_products?gender=sports`);
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
    setSelectedGender('Sports');
    setSelectedCategory('All Categories');
    setProducts(allProducts);
  };

  // Product Card Component
  const ProductCard = ({ product }) => (
    <div className="sports-product-card">
      <div className="sports-product-image-container">
        <img 
          src={product.image} 
          alt={product.name} 
          className="sports-product-img"
          onError={(e) => {
            e.target.onerror = null;
            e.target.style.opacity = '0.5';
          }}
        />
        <div className="sports-product-hover-overlay">
          <Link  className="sports-view-details-btn" to={`/usertab/details/${product.id}`}>VIEW DETAILS</Link>
        </div>
      </div>
      <div className="sports-product-details">
        <h3 className="sports-product-title">{product.name}</h3>
        <p className="sports-product-brand">{product.brand || 'HummingTone'}</p>
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
                disabled
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
      {loading ? (
        <div className="sports-products-section">
          <div className="sports-section-intro">
            <h2 className="sports-section-heading">Sports Collection</h2>
            <div className="sports-heading-accent"></div>
            <p className="sports-section-description">Explore our curated collection of premium products</p>
          </div>
          <LottieLoader size={160} message="Loading sports collection..." />
        </div>
      ) : products.length > 0 ? (
        <div className="sports-products-section">
          <div className="sports-section-intro">
            <h2 className="sports-section-heading">Sports Collection</h2>
            <div className="sports-heading-accent"></div>
            <p className="sports-section-description">Explore our curated collection of premium products</p>
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
          <Link className="sports-view-all-button" to="/usertab/all-products">VIEW ALL PRODUCTS</Link>
        </div>
      )}
      
      {/* Footer */}
      <UserFooter />
    </div>
  );
};

export default Sports;
