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
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch products from the API for Men's category
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/user/fetch_products?gender=men`);
        const fetchedProducts = response.data.map(product => ({
          ...product,
          price: parseFloat(product.price),
          image: getImageUrl(product.image_path),
        }));
        setProducts(fetchedProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

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
      {/* Products Section - Conditional Rendering */}
      {loading ? (
        <div className="mens-products-section">
          <div className="mens-section-intro">
            <h2 className="mens-section-heading">Men's Collection</h2>
            <div className="mens-heading-accent"></div>
          </div>
          <LottieLoader size={160} message="Loading men's collection..." />
        </div>
      ) : products.length > 0 ? (
        <div className="mens-products-section">
          <div className="mens-section-intro">
            <h2 className="mens-section-heading">Men's Collection</h2>
            <div className="mens-heading-accent"></div>
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
