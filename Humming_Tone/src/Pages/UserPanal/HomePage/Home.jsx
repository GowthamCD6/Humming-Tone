import React, { useEffect, useState } from 'react';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import homeImage from '../../../assets/home1.png';
import demoImage from '../../../assets/demo.jpeg';
import UserFooter from '../../../components/User-Footer-Card/UserFooter';
import ProductGridSkeleton from '../../../components/ProductSkeleton/ProductSkeleton';
import './Home.css';
import axios from 'axios';  // Import axios
import { Link, useLocation } from 'react-router-dom';
import { API_BASE_URL, getImageUrl } from '../../../utils/apiConfig';

const Home = ({ onViewDetails: _onViewDetails = () => {} }) => {
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
  }, []);  // Empty dependency array means this will run once when the component mounts

  // Reusable Product Card Component for cleaner code
  const ProductCard = ({ product }) => (
    <div className="all-products-product-card">
      <Link to={`/usertab/details/${product.id}`} className="all-products-product-link">
        <div className="all-products-product-image-container">
          <img
            src={product.image}
            alt={product.name}
            className="all-products-product-image"
          />
        </div>
      </Link>
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

        {loadingFeatured ? (
          <ProductGridSkeleton count={3} />
        ) : featuredProducts.length > 0 ? (
          <div className="product-layout-grid">
            {featuredProducts.map(item => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        ) : (
          <p className="no-products-message" style={{ textAlign: 'center', width: '100%', color: '#666', padding: '2rem 0' }}>No featured products available at the moment.</p>
        )}
      </section>

      {/* New Arrivals Section */}
      <section className="product-section" id="new-arrivals">
        <div className="section-intro">
          <h2 className="section-heading">New Arrivals</h2>
          <div className="heading-accent"></div>
          <p className="section-description">Fresh styles just for you</p>
        </div>

        {loadingNewArrivals ? (
          <ProductGridSkeleton count={3} />
        ) : newArrivals.length > 0 ? (
          <div className="product-layout-grid">
            {newArrivals.map(item => (
              <ProductCard key={item.id} product={item} />
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