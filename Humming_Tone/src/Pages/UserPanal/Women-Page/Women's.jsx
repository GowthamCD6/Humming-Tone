import React, { useState, useEffect } from 'react';
import demoImage from '../../../assets/demo.jpeg';
import UserFooter from '../../../components/User-Footer-Card/UserFooter';
import LottieLoader from '../../../components/LottieLoader/LottieLoader';
import './Women.css';
import { getGenderOptions } from '../../../utils/siteContentStore';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { API_BASE_URL, getImageUrl } from '../../../utils/apiConfig';

const Women = ({ onViewDetails: _onViewDetails = () => {} }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch products from the API for Women's category
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${API_BASE_URL}/user/fetch_products?gender=women`
        );

        const fetchedProducts = response.data.map(product => ({
          ...product,
          price: parseFloat(product.price),
          image: getImageUrl(product.image_path)
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

  const ProductCard = ({ product }) => (
    <div className="women-product-card">
      <div className="women-product-image-container">
        <img
          src={product.image}
          alt={product.name}
          className="women-product-img"
          onError={(e) => {
            e.target.onerror = null;
            e.target.style.opacity = '0.5';
          }}
        />
        <div className="women-product-hover-overlay">
          <Link
            className="women-view-details-btn"
            to={`/usertab/details/${product.id}`}
          >
            VIEW DETAILS
          </Link>
        </div>
      </div>
      <div className="women-product-details">
        <h3 className="women-product-title">{product.name}</h3>
        <p className="women-product-brand">{product.brand || 'HummingTone'}</p>
        <p className="women-product-price">₹{product.price.toFixed(2)}</p>
      </div>
    </div>
  );

  return (
    <div className="women-collection-page">
      {/* Products Section - Conditional Rendering */}
      {loading ? (
        <div className="women-products-section">
          <div className="women-section-intro">
            <h2 className="women-section-heading">Women's Collection</h2>
            <div className="women-heading-accent"></div>
          </div>
          <LottieLoader size={160} message="Loading women's collection..." />
        </div>
      ) : products.length > 0 ? (
        <div className="women-products-section">
          <div className="women-section-intro">
            <h2 className="women-section-heading">Women's Collection</h2>
            <div className="women-heading-accent"></div>
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