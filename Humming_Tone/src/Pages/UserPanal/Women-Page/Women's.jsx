import React, { useState, useEffect } from 'react';
import demoImage from '../../../assets/demo.jpeg';
import UserFooter from '../../../components/User-Footer-Card/UserFooter';
import './Women.css';
import { getGenderOptions, getCategoryOptionsForGender } from '../../../utils/siteContentStore';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Women = ({ onViewDetails = () => {} }) => {
  const [selectedGender, setSelectedGender] = useState('Women');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [products, setProducts] = useState([]);

  const genderOptions = getGenderOptions();
  const categoryOptions = getCategoryOptionsForGender(selectedGender);

  // Fetch products when gender changes
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/user/fetch_products?gender=${selectedGender.toLowerCase()}`
        );

        const fetchedProducts = response.data.map(product => ({
          ...product,
          price: parseFloat(product.price),
          image: product.image_path
            ? `http://localhost:5000/${product.image_path}`
            : demoImage
        }));

        setProducts(fetchedProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, [selectedGender]);

  const handleApplyFilters = () => {
    console.log('Applying filters:', { selectedGender, selectedCategory });
  };

  const handleClearAll = () => {
    setSelectedGender('Women');
    setSelectedCategory('All Categories');
  };

  const ProductCard = ({ product }) => (
    <div className="women-product-card">
      <div className="women-product-image-container">
        <img
          src={product.image === "demo" ? demoImage : product.image}
          alt={product.name}
          className="women-product-img"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/400x500?text=Product+Image';
          }}
        />
        <div className="women-product-hover-overlay">
          <Link
            className="all-products-view-details-btn"
            to={`/usertab/details/${product.id}`}
          >
            VIEW DETAILS
          </Link>
        </div>
      </div>
      <div className="women-product-details">
        <h3 className="women-product-title">{product.name}</h3>
        <p className="women-product-brand">{product.brand}</p>
        <p className="women-product-price">₹{product.price.toFixed(2)}</p>
      </div>
    </div>
  );

  return (
    <div className="women-collection-page">
      {/* Header */}
      <div className="women-header">
        <h1 className="women-title">Our Collection</h1>
        <p className="women-item-count">{products.length} ITEMS FOUND</p>
      </div>

      <div className="women-divider"></div>

      {/* Filters */}
      <div className="women-filter-container">
        <h2 className="women-filter-title">Refine Your Selection</h2>

        <div className="women-filter-row">
          <div className="women-filter-group">
            <label className="women-filter-label">GENDER</label>
            <div className="women-select-wrapper">
              <select
                className="women-select"
                value={selectedGender}
                onChange={(e) => setSelectedGender(e.target.value)}
              >
                {genderOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              <span className="women-select-arrow">▼</span>
            </div>
          </div>

          <div className="women-filter-group">
            <label className="women-filter-label">CATEGORY</label>
            <div className="women-select-wrapper">
              <select
                className="women-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categoryOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              <span className="women-select-arrow">▼</span>
            </div>
          </div>

          <div className="women-button-group">
            <button className="women-apply-button" onClick={handleApplyFilters}>
              APPLY FILTERS
            </button>
            <button className="women-clear-button" onClick={handleClearAll}>
              CLEAR ALL
            </button>
          </div>
        </div>
      </div>

      {/* Products */}
      {products.length > 0 ? (
        <div className="women-products-section">
          <div className="women-section-intro">
            <h2 className="women-section-heading">Women's Collection</h2>
            <div className="women-heading-accent"></div>
            <p className="women-section-description">
              Explore our curated collection of premium women's wear
            </p>
          </div>

          <div className="women-product-grid">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      ) : (
        <div className="women-no-products-container">
          <h2 className="women-no-products-title">No Products Found</h2>
          <p className="women-no-products-text">
            Try adjusting your filters or browse our complete<br />collection.
          </p>
          <Link
            className="women-view-all-button no-underline"
            to="/usertab/all-products"
          >
            VIEW ALL PRODUCTS
          </Link>
        </div>
      )}

      <UserFooter />
    </div>
  );
};

export default Women;