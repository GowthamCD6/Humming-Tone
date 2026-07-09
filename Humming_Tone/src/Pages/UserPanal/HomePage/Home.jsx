import React, { useEffect, useState } from 'react';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import homeImage from '../../../assets/home1.png';
import demoImage from '../../../assets/demo.jpeg';
import UserFooter from '../../../components/User-Footer-Card/UserFooter';
import './Home.css';
import axios from 'axios';  // Import axios
import { Link, useLocation } from 'react-router-dom';

const Home = ({ onViewDetails = () => {} }) => {
  const [featuredProducts, setFeaturedProducts] = useState([]); // State for featured products
  const [newArrivals, setNewArrivals] = useState([]); // State for new arrivals
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

  // Fetch featured products and new arrivals from the backend
  useEffect(() => {
    const fetchNewArrivals = async () => {
      try {
        const response = await axios.get('http://localhost:5000/user/fetch_new_arrivals');
        setNewArrivals(response.data.map(product => ({
          ...product,
          price: parseFloat(product.price),
          image: product.image_path ? `http://localhost:5000/${product.image_path}` : demoImage,
        })));
      } catch (error) {
        console.error('Error fetching new arrivals:', error);
      } finally {
        setLoadingNewArrivals(false);
      }
    };

    const fetchFeaturedProducts = async () => {
      try {
        const response = await axios.get('http://localhost:5000/user/fetch_featured_products');
        setFeaturedProducts(response.data.map(product => ({
          ...product,
          price: parseFloat(product.price),
          image: product.image_path ? `http://localhost:5000/${product.image_path}` : demoImage,
        })));
      } catch (error) {
        console.error('Error fetching featured products:', error);
      } finally {
        setLoadingFeatured(false);
      }
    };

    fetchNewArrivals();
    fetchFeaturedProducts();
  }, []);  // Empty dependency array means this will run once when the component mounts

  // Reusable Product Card Component for cleaner code
  const ProductCard = ({ product }) => (
    <div className="all-products-product-card">
      <div className="all-products-product-image-container">
        {/* Placeholder for actual product image */}
        <img src={product.image} alt={product.name} className="all-products-product-img"
             onError={(e) => { e.target.src = 'https://via.placeholder.com/400x500?text=Product+Image' }} />
        
        <div className="all-products-product-hover-overlay">
          <Link  className="all-products-view-details-btn no-underline" to={`/usertab/details/${product.id}`}>VIEW DETAILS</Link>
        </div>
      </div>
      <div className="all-products-product-details">
        <h3 className="all-products-product-title">{product.name}</h3>
        <p className="all-products-product-brand">{product.brand}</p>
        <p className="all-products-product-price">₹{product.price.toFixed(2)}</p>
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

      {/* Featured Products Section */}
      <section className="product-section alt-bg" id="featured-products">
        <div className="section-intro">
          <h2 className="section-heading">Featured Products</h2>
          <div className="heading-accent"></div>
          <p className="section-description">Handpicked items from our collection</p>
        </div>

        <div className="product-layout-grid">
          {loadingFeatured ? (
            <p className="loading-message">Loading featured products...</p>
          ) : featuredProducts.length > 0 ? (
            featuredProducts.map(item => (
              <ProductCard key={item.id} product={item} />
            ))
          ) : (
            <p className="no-products-message" style={{ gridColumn: '1 / -1', textAlign: 'center', width: '100%', color: '#666', padding: '2rem 0' }}>No featured products available at the moment.</p>
          )}
        </div>
      </section>

      {/* New Arrivals Section */}
      <section className="product-section" id="new-arrivals">
        <div className="section-intro">
          <h2 className="section-heading">New Arrivals</h2>
          <div className="heading-accent"></div>
          <p className="section-description">Fresh styles just for you</p>
        </div>

        <div className="product-layout-grid">
          {loadingNewArrivals ? (
            <p className="loading-message">Loading new arrivals...</p>
          ) : newArrivals.length > 0 ? (
            newArrivals.map(item => (
              <ProductCard key={item.id} product={item} />
            ))
          ) : (
            <p className="no-products-message" style={{ gridColumn: '1 / -1', textAlign: 'center', width: '100%', color: '#666', padding: '2rem 0' }}>No new arrivals available at the moment.</p>
          )}
        </div>
      </section>

      {/* Footer */}
      <UserFooter />
    </main>
  );
};

export default Home;