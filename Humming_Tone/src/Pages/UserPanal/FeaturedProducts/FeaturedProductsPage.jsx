import React, { useState, useEffect } from 'react';
import UserFooter from '../../../components/User-Footer-Card/UserFooter';
import LottieLoader from '../../../components/LottieLoader/LottieLoader';
import { Link } from 'react-router-dom';
import { API_BASE_URL, getImageUrl } from '../../../utils/apiConfig';
import axios from 'axios';
import '../HomePage/Home.css';
import './FeaturedProducts.css';

const FeaturedProductsPage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/user/fetch_featured_products`);
        setFeaturedProducts(
          response.data.map((product) => ({
            ...product,
            price: parseFloat(product.price),
            image: getImageUrl(product.image_path),
          }))
        );
      } catch (error) {
        console.error('Error fetching featured products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  const LuxuryProductCard = ({ product }) => (
    <div className="luxury-product-card">
      <div className="luxury-product-image-container">
        <img
          src={product.image}
          alt={product.name}
          className="luxury-product-img"
          onError={(e) => {
            e.target.onerror = null;
            e.target.style.opacity = '0.4';
          }}
        />
        <div className="all-products-product-hover-overlay">
          <Link to={`/usertab/details/${product.id}`} className="all-products-view-details-btn">
            VIEW DETAILS
          </Link>
        </div>
      </div>
      <div className="luxury-product-meta">
        <span className="luxury-product-category">
          {product.category || product.brand || 'FEATURED ATELIER'}
        </span>
        <h3 className="luxury-product-title">
          <Link to={`/usertab/details/${product.id}`} className="luxury-product-title-link">
            {product.name}
          </Link>
        </h3>
        <p className="luxury-product-price">₹{product.price.toLocaleString('en-IN')}</p>
      </div>
    </div>
  );

  return (
    <div className="featured-products-page userpanal-homepage">
      <div className="featured-page-container">
        <div className="featured-page-header">
          <span className="featured-page-tag">CURATED ATELIER</span>
          <h1 className="featured-page-title">Featured Collection</h1>
          <div className="featured-heading-accent"></div>
          <p className="featured-page-subtitle">
            Explore our complete lineup of signature handpicked garments, tailored with absolute precision.
          </p>
        </div>

        {loading ? (
          <div className="featured-page-loader">
            <LottieLoader size={160} message="Loading featured collection..." />
          </div>
        ) : featuredProducts.length > 0 ? (
          <div className="featured-full-grid">
            {featuredProducts.map((product) => (
              <LuxuryProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="featured-no-products">
            <h2>No Featured Products Found</h2>
            <p>Our curated featured collection is currently being updated.</p>
            <Link to="/usertab/all-products" className="featured-browse-all-btn">
              BROWSE ALL PRODUCTS
            </Link>
          </div>
        )}
      </div>

      <UserFooter />
    </div>
  );
};

export default FeaturedProductsPage;
