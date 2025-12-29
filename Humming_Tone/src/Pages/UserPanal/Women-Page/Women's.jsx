import React, { useState, useEffect } from 'react';
import demoImage from '../../../assets/demo.jpeg';
import UserFooter from '../../../components/User-Footer-Card/UserFooter';
import './Women.css';
import { getGenderOptions, getCategoryOptionsForGender } from '../../../utils/siteContentStore';
import axios from 'axios';  // Import axios
import { Link } from 'react-router-dom';

const Women = ({ onViewDetails = () => {} }) => {
  const [selectedGender, setSelectedGender] = useState('Women');
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
        // For frontend demo, set dummy products
        setProducts([
          {
            id: 1,
            name: 'Elegant Dress',
            brand: 'Fashion Brand',
            price: 2999.99,
            image: demoImage
          },
          {
            id: 2,
            name: 'Casual Blouse',
            brand: 'Style Co',
            price: 1499.99,
            image: demoImage
          },
          {
            id: 3,
            name: 'Designer Skirt',
            brand: 'Luxury Wear',
            price: 3999.99,
            image: demoImage
          }
        ]);
      }
    };

    fetchProducts();
  }, [selectedGender]);  // Trigger API call when gender changes

  const handleApplyFilters = () => {
    console.log('Applying filters:', { selectedGender, selectedCategory });
  };

  const handleClearAll = () => {
    setSelectedGender('Women');
    setSelectedCategory('All Categories');
  };

  // Product Card Component
  const ProductCard = ({ product }) => (
    <div className="womens-product-card">
      <div className="womens-product-image-container">
        <img 
          src={product.image === "demo" ? demoImage : product.image} 
          alt={product.name} 
          className="womens-product-img"
          onError={(e) => { e.target.src = 'https://via.placeholder.com/400x500?text=Product+Image' }}  // Fallback for missing images
        />
        <div className="womens-product-hover-overlay">
          <Link  className="all-products-view-details-btn" to={`/usertab/details/${product.id}`}>VIEW DETAILS</Link>
        </div>
      </div>
      <div className="womens-product-details">
        <h3 className="womens-product-title">{product.name}</h3>
        <p className="womens-product-brand">{product.brand}</p>
        <p className="womens-product-price">₹{product.price.toFixed(2)}</p>
      </div>
    </div>
  );

  return (
    <div className="womens-collection-page">
      {/* Header Section */}
      <div className="womens-header">
        <h1 className="womens-title">Our Collection</h1>
        <p className="womens-item-count">{products.length} ITEMS FOUND</p>
      </div>

      <div className="womens-divider"></div>

      {/* Filter Section */}
      <div className="womens-filter-container">
        <h2 className="womens-filter-title">Refine Your Selection</h2>
        
        <div className="womens-filter-row">
          {/* Gender Dropdown */}
          <div className="womens-filter-group">
            <label className="womens-filter-label">GENDER</label>
            <div className="womens-select-wrapper">
              <select 
                className="womens-select"
                value={selectedGender}
                onChange={(e) => setSelectedGender(e.target.value)}
              >
                {genderOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              <span className="womens-select-arrow">▼</span>
            </div>
          </div>

          {/* Category Dropdown */}
          <div className="womens-filter-group">
            <label className="womens-filter-label">CATEGORY</label>
            <div className="womens-select-wrapper">
              <select 
                className="womens-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categoryOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              <span className="womens-select-arrow">▼</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="womens-button-group">
            <button 
              className="womens-apply-button"
              onClick={handleApplyFilters}
            >
              APPLY FILTERS
            </button>
            <button 
              className="womens-clear-button"
              onClick={handleClearAll}
            >
              CLEAR ALL
            </button>
          </div>
        </div>
      </div>

      {/* Products Section - Conditional Rendering */}
      {products.length > 0 ? (
        <div className="womens-products-section">
          <div className="womens-section-intro">
            <h2 className="womens-section-heading">Women's Collection</h2>
            <div className="womens-heading-accent"></div>
            <p className="womens-section-description">Explore our curated collection of premium women's wear</p>
          </div>
          
          <div className="womens-product-grid">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      ) : (
        <div className="womens-no-products-container">
          <h2 className="womens-no-products-title">No Products Found</h2>
          <p className="womens-no-products-text">
            Try adjusting your filters or browse our complete<br />collection.
          </p>
          <Link className="womens-view-all-button no-underline" to="/usertab/all-products">VIEW ALL PRODUCTS</Link>
        </div>
      )}
      
      {/* Footer */}
      <UserFooter />
    </div>
  );
};

export default Women;