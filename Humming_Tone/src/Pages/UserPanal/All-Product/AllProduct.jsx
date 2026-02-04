import React, { useState, useEffect, useMemo } from 'react';
import demoImage from '../../../assets/demo.jpeg';
import UserFooter from '../../../components/User-Footer-Card/UserFooter';
import './AllProduct.css';
import { getGenderOptions, getCategoryOptionsForGender } from '../../../utils/siteContentStore';
import { Link } from 'react-router-dom';

/* 🔹 Memoized Product Card (UI UNCHANGED) */
const ProductCard = React.memo(({ product }) => (
  <div className="all-products-product-card">
    <div className="all-products-product-image-container">
      <img
        src={product.image || demoImage}
        alt={product.name}
        className="all-products-product-img"
        onError={(e) => {
          e.target.src = 'https://via.placeholder.com/400x500?text=Product+Image';
        }}
      />
      <div className="all-products-product-hover-overlay">
        <Link
          className="all-products-view-details-btn"
          to={`/usertab/details/${product.id}`}
        >
          VIEW DETAILS
        </Link>
      </div>
    </div>
    <div className="all-products-product-details">
      <h3 className="all-products-product-title">{product.name}</h3>
      <p className="all-products-product-brand">{product.brand}</p>
      <p className="all-products-product-price">₹{product.price.toFixed(2)}</p>
    </div>
  </div>
));

const AllProductPage = ({ onViewDetails = () => {} }) => {
  const [selectedGender, setSelectedGender] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [gridColumns, setGridColumns] = useState(3); // Grid layout state

  const [allProducts, setAllProducts] = useState([]);
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  /* 🔹 Memoized gender options */
  const genderOptions = useMemo(
    () => ['All Gender', ...getGenderOptions()],
    []
  );

  /* 🔹 Memoized category options */
  const categoryOptions = useMemo(() => {
    return selectedGender === 'All'
      ? ['All Categories']
      : getCategoryOptionsForGender(selectedGender);
  }, [selectedGender]);

  // 🔹 Fetch products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/admin/fetch_products');
      const data = await response.json();

      const formattedProducts = data.map(product => ({
        id: product.id,
        name: product.name,
        brand: product.brand || 'HummingTone',
        price: Number(product.price), // ✅ FIXED
        image: product.image_path
          ? `http://localhost:5000/${product.image_path.replace(/\\/g, '/')}`
          : demoImage,
        gender: product.gender,
        category: product.category
      }));

      setAllProducts(formattedProducts);
      setProducts(formattedProducts);
    } catch (err) {
      setError('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // 🔹 APPLY FILTERS
  const handleApplyFilters = () => {
    let filtered = [...allProducts];

    if (selectedGender !== 'All' && selectedGender !== 'All Gender') {
      filtered = filtered.filter(
        product => product.gender === selectedGender
      );
    }

    if (selectedCategory !== 'All Categories') {
      filtered = filtered.filter(
        product => product.category === selectedCategory
      );
    }

    setProducts(filtered);
  };

  // 🔹 CLEAR ALL
  const handleClearAll = () => {
    setSelectedGender('All');
    setSelectedCategory('All Categories');
    setProducts(allProducts);
  };

  return (
    <div className="all-products-collection-page">
      {/* Header */}
      <div className="all-products-header">
        <h1 className="all-products-title">Our Collection</h1>
        <p className="all-products-item-count">{products.length} ITEMS FOUND</p>
      </div>

      <div className="all-products-divider"></div>

      {/* Filters */}
      <div className="all-products-filter-container">
        <h2 className="all-products-filter-title">Refine Your Selection</h2>

        <div className="all-products-filter-row">
          {/* Gender */}
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

          {/* Category */}
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

          {/* Buttons */}
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

      {/* Products */}
      {loading ? (
        <p>Loading products...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <div className="all-products-products-section">
          <div className="all-products-section-intro">
            <div className="all-products-intro-header">
              <div className="all-products-intro-left">
                <h2 className="all-products-section-heading">All Products</h2>
                <div className="all-products-heading-accent"></div>
              </div>
              
              <div className="all-products-intro-right">
                <div className="all-products-grid-toggle">
                  <button
                    className={`all-products-grid-btn ${gridColumns === 3 ? 'active' : ''}`}
                    onClick={() => setGridColumns(3)}
                    title="3 columns"
                  >
                    <div className="grid-icon-3">
                      <span></span><span></span><span></span>
                    </div>
                  </button>
                  <button
                    className={`all-products-grid-btn ${gridColumns === 4 ? 'active' : ''}`}
                    onClick={() => setGridColumns(4)}
                    title="4 columns"
                  >
                    <div className="grid-icon-4">
                      <span></span><span></span><span></span><span></span>
                    </div>
                  </button>
                </div>
                <div className="all-products-count">
                  <span className="all-products-count-number">{products.length} Products</span>
                </div>
              </div>
            </div>
            
            <p className="all-products-section-description">
              Explore our complete collection of premium products
            </p>
          </div>

          <div className={`all-products-product-grid grid-cols-${gridColumns}`}>
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}

      <UserFooter />
    </div>
  );
};

export default AllProductPage;
