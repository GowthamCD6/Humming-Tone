import React, { useState, useEffect } from 'react';
import UserFooter from '../../../components/User-Footer-Card/UserFooter';
import LottieLoader from '../../../components/LottieLoader/LottieLoader';
import './Children\'s.css';
import axios from 'axios';  // Import axios
import { Link } from 'react-router-dom';
import { API_BASE_URL, getImageUrl } from '../../../utils/apiConfig';

const Children = ({ onViewDetails: _onViewDetails = () => {} }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch products from the API for Children's category
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/user/fetch_products?gender=children`);
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
    <div className="childrens-product-card">
      <div className="childrens-product-image-container">
        <img 
          src={product.image} 
          alt={product.name} 
          className="childrens-product-img"
          onError={(e) => {
            e.target.onerror = null;
            e.target.style.opacity = '0.5';
          }}
        />
        <div className="childrens-product-hover-overlay">
          <Link  className="childrens-view-details-btn" to={`/usertab/details/${product.id}`}>VIEW DETAILS</Link>
        </div>
      </div>
      <div className="childrens-product-details">
        <h3 className="childrens-product-title">{product.name}</h3>
        <p className="childrens-product-brand">{product.brand || 'HummingTone'}</p>
        <p className="childrens-product-price">₹{product.price.toFixed(2)}</p>
      </div>
    </div>
  );

  return (
    <div className="childrens-collection-page">
      {/* Products Section - Conditional Rendering */}
      {loading ? (
        <div className="childrens-products-section">
          <div className="childrens-section-intro">
            <h2 className="childrens-section-heading">Children's Collection</h2>
            <div className="childrens-heading-accent"></div>
          </div>
          <LottieLoader size={160} message="Loading children's collection..." />
        </div>
      ) : products.length > 0 ? (
        <div className="childrens-products-section">
          <div className="childrens-section-intro">
            <h2 className="childrens-section-heading">Children's Collection</h2>
            <div className="childrens-heading-accent"></div>
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
