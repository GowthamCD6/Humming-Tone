import React, { useEffect, useState } from 'react';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import homeImage from '../../../assets/home1.png';
import craftsmanshipImage from '../../../assets/craftsmanship.jpg';
import UserFooter from '../../../components/User-Footer-Card/UserFooter';
import ProductGridSkeleton from '../../../components/ProductSkeleton/ProductSkeleton';
import './Home.css';
import axios from 'axios';
import { Link, useLocation } from 'react-router-dom';
import { API_BASE_URL, getImageUrl } from '../../../utils/apiConfig';

const Home = ({ onViewDetails: _onViewDetails = () => {} }) => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [loadingNewArrivals, setLoadingNewArrivals] = useState(true);
  const location = useLocation();

  useEffect(() => {
    if (!loadingFeatured && !loadingNewArrivals && location.hash) {
      const id = location.hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
      }
    }
  }, [location, loadingFeatured, loadingNewArrivals]);

  useEffect(() => {
    const fetchNewArrivals = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/user/fetch_new_arrivals`);
        setNewArrivals(response.data.map(product => ({
          ...product,
          price: parseFloat(product.price),
          image: getImageUrl(product.image_path),
        })));
      } catch (error) {
        console.error('Error fetching new arrivals:', error);
      } finally {
        setLoadingNewArrivals(false);
      }
    };

    const fetchFeaturedProducts = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/user/fetch_featured_products`);
        setFeaturedProducts(response.data.map(product => ({
          ...product,
          price: parseFloat(product.price),
          image: getImageUrl(product.image_path),
        })));
      } catch (error) {
        console.error('Error fetching featured products:', error);
      } finally {
        setLoadingFeatured(false);
      }
    };

    fetchFeaturedProducts();
    fetchNewArrivals();
  }, []);

  // Luxury Minimalist Editorial Product Card
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
          {product.category || product.brand || 'ATELIER COLLECTION'}
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
    <main className="userpanal-homepage home-static-page">
      {/* Hero Section */}
      <section className="hero-banner">
        <div className="hero-visual" style={{ backgroundImage: `url(${homeImage})` }}>
          <div className="hero-tint"></div>
        </div>
        
        <div className="hero-text-content">
          <h1 className="hero-main-title">Elevate Your Style</h1>
          <p className="hero-sub-text">Discover our curated collection of premium clothing</p>
          <div className="hero-buttons">
            <Link to="/usertab/customize" className="hero-cta-button">SHOP CUSTOMIZE PRODUCT</Link>
            <Link to="/usertab/about-us" className="hero-secondary-button">ABOUT OUR STORE</Link>
          </div>
        </div>

        <div className="hero-scroll-down">
          <KeyboardArrowDownIcon className="bounce-icon" />
        </div>
      </section>

      {/* Featured Products Section (Editorial 4-Column Grid) */}
      <section className="product-section luxury-featured-section" id="featured-products">
        <div className="editorial-section-header">
          <div className="editorial-header-left">
            <h2 className="section-heading">Featured Collection</h2>
          </div>
          <div className="editorial-header-right">
            <Link to="/usertab/featured-products" className="editorial-view-all-link">
              VIEW ALL
            </Link>
          </div>
        </div>

        {loadingFeatured ? (
          <ProductGridSkeleton count={4} />
        ) : featuredProducts.length > 0 ? (
          <div className="luxury-editorial-grid">
            {featuredProducts.slice(0, 4).map(item => (
              <LuxuryProductCard key={item.id} product={item} />
            ))}
          </div>
        ) : (
          <p className="no-products-message" style={{ textAlign: 'center', width: '100%', color: '#666', padding: '2rem 0' }}>No featured products available at the moment.</p>
        )}
      </section>

      {/* A Legacy of Craftsmanship - Editorial Storytelling Section */}
      <section className="craftsmanship-story-section">
        <div className="craftsmanship-container">
          <div className="craftsmanship-content">
            <span className="craftsmanship-tag">OUR HERITAGE</span>
            <h2 className="craftsmanship-title">A Legacy of Craftsmanship</h2>
            <p className="craftsmanship-description">
              Every piece in our collection is a testament to meticulous design and unparalleled tailoring. 
              At the Humming Tone atelier, we believe true luxury lies in the details—the precision of a seam, 
              the weight of fine curated fabrics, and a silhouette that commands the room without a single word.
            </p>
            <div className="craftsmanship-cta-wrap">
              <Link to="/usertab/about-us" className="craftsmanship-link">
                <span>DISCOVER THE ATELIER</span>
                <span className="craftsmanship-arrow">→</span>
              </Link>
            </div>
          </div>
          
          <div className="craftsmanship-visual-wrap">
            <div className="craftsmanship-image-frame">
              <img 
                src={craftsmanshipImage} 
                alt="Master tailor craftsmanship in atelier studio" 
                className="craftsmanship-image"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Infinite Loop Luxury Perks Marquee Slider */}
      <section className="luxury-ticker-section">
        <div className="luxury-ticker-track">
          {[...Array(2)].map((_, trackIdx) => (
            <div className="luxury-ticker-group" key={trackIdx}>
              <div className="ticker-item">
                <span className="ticker-icon">✦</span>
                <span className="ticker-title">COMPLIMENTARY EXPRESS DELIVERY</span>
                <span className="ticker-sub">ON ALL DOMESTIC ORDERS</span>
              </div>
              <span className="ticker-dot">•</span>

              <div className="ticker-item">
                <span className="ticker-icon">✦</span>
                <span className="ticker-title">ALL TAXES & DUTIES INCLUDED</span>
                <span className="ticker-sub">TRANSPARENT ATELIER PRICING</span>
              </div>
              <span className="ticker-dot">•</span>

              <div className="ticker-item">
                <span className="ticker-icon">✦</span>
                <span className="ticker-title">EXCLUSIVE PROMO CODES</span>
                <span className="ticker-sub">USE CODE "HUMMING10" FOR 10% OFF</span>
              </div>
              <span className="ticker-dot">•</span>

              <div className="ticker-item">
                <span className="ticker-icon">✦</span>
                <span className="ticker-title">100% BESPOKE CRAFTSMANSHIP</span>
                <span className="ticker-sub">PREMIUM ITALIAN WOOL & COTTON</span>
              </div>
              <span className="ticker-dot">•</span>

              <div className="ticker-item">
                <span className="ticker-icon">✦</span>
                <span className="ticker-title">EASY 7-DAY EXCHANGES</span>
                <span className="ticker-sub">SEAMLESS DOORSTEP PICKUP</span>
              </div>
              <span className="ticker-dot">•</span>
            </div>
          ))}
        </div>
      </section>

      {/* New Arrivals Section */}
      <section className="product-section alt-bg" id="new-arrivals">
        <div className="section-intro">
          <h2 className="section-heading">New Arrivals</h2>
          <div className="heading-accent"></div>
          <p className="section-description">Fresh styles curated for the modern wardrobe</p>
        </div>

        {loadingNewArrivals ? (
          <ProductGridSkeleton count={4} />
        ) : newArrivals.length > 0 ? (
          <div className="luxury-editorial-grid">
            {newArrivals.slice(0, 4).map(item => (
              <LuxuryProductCard key={item.id} product={item} />
            ))}
          </div>
        ) : (
          <p className="no-products-message" style={{ textAlign: 'center', width: '100%', color: '#666', padding: '2rem 0' }}>No new arrivals available at the moment.</p>
        )}
      </section>

      {/* Footer */}
      <UserFooter />
    </main>
  );
};

export default Home;