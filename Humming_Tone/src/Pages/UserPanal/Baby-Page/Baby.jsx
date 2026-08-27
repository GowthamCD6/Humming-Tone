import React, { useState, useEffect } from 'react';
import UserFooter from '../../../components/User-Footer-Card/UserFooter';
import LottieLoader from '../../../components/LottieLoader/LottieLoader';
import './Baby.css';
import axios from 'axios';  // Import axios
import { Link } from 'react-router-dom';
import { API_BASE_URL, getImageUrl } from '../../../utils/apiConfig';

const Baby = ({ onViewDetails: _onViewDetails = () => {} }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch products from the API for Baby category
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/user/fetch_products?gender=baby`);
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
      {/* Products Section - Conditional Rendering */}
      {loading ? (
        <div className="baby-products-section">
          <div className="baby-section-intro">
            <h2 className="baby-section-heading">Baby Collection</h2>
            <div className="baby-heading-accent"></div>
          </div>
          <LottieLoader size={160} message="Loading baby collection..." />
        </div>
      ) : products.length > 0 ? (
        <div className="baby-products-section">
          <div className="baby-section-intro">
            <h2 className="baby-section-heading">Baby Collection</h2>
            <div className="baby-heading-accent"></div>
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
