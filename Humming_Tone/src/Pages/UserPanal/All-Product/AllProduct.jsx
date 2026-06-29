import React, { useState, useEffect } from 'react';
import demoImage from '../../../assets/demo.jpeg';
import UserFooter from '../../../components/User-Footer-Card/UserFooter';
import './AllProduct.css';
import { getGenderOptions, getCategoryOptionsForGender } from '../../../utils/siteContentStore';
import axios from 'axios';  // Import axios
import { Link } from 'react-router-dom';

const Men = ({ onViewDetails = () => {} }) => {
  const [selectedGender, setSelectedGender] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  
  const [allProducts, setAllProducts] = useState([]);
  const [products, setProducts] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState(['All Categories']);

  const genderOptions = ['All Gender', ...getGenderOptions()];

  // Fetch all products initially
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('http://localhost:5000/user/fetch_products');
        const data = await response.json();
        const formattedProducts = data.map(product => ({
          ...product,
          price: parseFloat(product.price),
          image: product.image_path ? `http://localhost:5000/${product.image_path.replace(/\\/g, '/')}` : demoImage,
        }));
        setAllProducts(formattedProducts);
        setProducts(formattedProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };
    fetchProducts();
  }, []);

  // Fetch categories dynamically when gender changes
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        let url = 'http://localhost:5000/user/fetch_categories';
        if (selectedGender !== 'All' && selectedGender !== 'All Gender') {
           url += `?gender=${selectedGender}`;
        }
        const response = await fetch(url);
        const data = await response.json();
        setCategoryOptions(['All Categories', ...data]);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, [selectedGender]);

  const handleApplyFilters = () => {
    let filtered = [...allProducts];

    if (selectedGender !== 'All' && selectedGender !== 'All Gender') {
      filtered = filtered.filter(p => p.gender === selectedGender);
    }

    if (selectedCategory !== 'All Categories') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    setProducts(filtered);
  };

  const handleClearAll = () => {
    setSelectedGender('All');
    setSelectedCategory('All Categories');
    setProducts(allProducts);
  };

  // Product Card Component
  const ProductCard = ({ product }) => (
    <div className="all-products-product-card">
      <div className="all-products-product-image-container">
        <img 
          src={product.image} 
          alt={product.name} 
          className="all-products-product-img"
          onError={(e) => { e.target.src = 'https://via.placeholder.com/400x500?text=Product+Image' }}
        />
        <div className="all-products-product-hover-overlay">
          <Link  className="all-products-view-details-btn" to={`/usertab/details/${product.id}`}>VIEW DETAILS</Link>
        </div>
      </div>
      <div className="all-products-product-details">
        <h3 className="all-products-product-title">{product.name}</h3>
        <p className="all-products-product-brand">{product.brand || 'HummingTone'}</p>
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
                onChange={(e) => {
                  setSelectedGender(e.target.value);
                  setSelectedCategory('All Categories'); // Reset category on gender change
                }}
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
            <p className="all-products-section-description">Explore our curated collection of premium products</p>
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
          <Link className="all-products-view-all-button" to="/usertab/all-products">VIEW ALL PRODUCTS</Link>
        </div>
      )}
      
      {/* Footer */}
      <UserFooter />
    </div>
  );
};

export default Men;
