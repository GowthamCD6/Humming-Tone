import React, { useEffect, useState } from 'react';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import homeImage from '../../../assets/home1.png';
import demoImage from '../../../assets/demo.jpeg';
import UserFooter from '../../../components/User-Footer-Card/UserFooter';
import './Home.css';
import axios from 'axios';  // Import axios

const Home = ({ onViewDetails = () => {} }) => {
  const [featuredProducts, setFeaturedProducts] = useState([]); // State for featured products
  const [newArrivals, setNewArrivals] = useState([]); // State for new arrivals

  // Fetch featured products and new arrivals from the backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Fetch new arrivals
        const newArrivalsResponse = await axios.get('http://localhost:5000/user/fetch_new_arrivals');
        console.log('New Arrivals:', newArrivalsResponse.data);  // Debug log to verify response
        setNewArrivals(newArrivalsResponse.data.map(product => ({
          ...product,
          price: parseFloat(product.price),  // Ensure price is a float
          image: product.image_path ? `http://localhost:5000/${product.image_path}` : demoImage,  // Handle image path
        })));
        // Fetch featured products
        const featuredResponse = await axios.get('http://localhost:5000/user/fetch_featured_products');
        console.log('Featured Products:', featuredResponse.data);  // Debug log to verify response
        setFeaturedProducts(featuredResponse.data.map(product => ({
          ...product,
          price: parseFloat(product.price),  // Ensure price is a float
          image: product.image_path ? `http://localhost:5000/${product.image_path}` : demoImage,  // Handle image path
        })));

      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, []);  // Empty dependency array means this will run once when the component mounts

  // Reusable Product Card Component for cleaner code
  const ProductCard = ({ product }) => (
    <div className="product-card">
      <div className="product-image-container">
        {/* Placeholder for actual product image */}
        <img src={product.image} alt={product.name} className="product-img"
             onError={(e) => { e.target.src = 'https://via.placeholder.com/400x500?text=Product+Image' }} />
        
        <div className="product-hover-overlay">
          <button
            className="view-details-btn"
            onClick={() => onViewDetails(product)}
          >
            VIEW DETAILS
          </button>
        </div>
      </div>
      <div className="product-details">
        <h3 className="product-title">{product.name}</h3>
        <p className="product-brand-name">{product.brand}</p>
        <p className="product-price-tag">₹{product.price.toFixed(2)}</p>
      </div>
    </div>
  );

  return (
    <main className="home-static-page">
      {/* Hero Section */}
      <section className="hero-banner">
        <div className="hero-visual">
          <div className="hero-tint"></div>
          {/* Replace with your local HomeImage path */}
          <img src={homeImage} alt="Premium Collection" className="hero-main-img" />
        </div>
        
        <div className="hero-text-content">
          <h1 className="hero-main-title">Elevate Your Style</h1>
          <p className="hero-sub-text">Discover our curated collection of premium clothing</p>
          <button className="hero-cta-button">SHOP CUSTOMIZE PRODUCT</button>
        </div>

        <div className="hero-scroll-down">
          <KeyboardArrowDownIcon className="bounce-icon" />
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="product-section alt-bg">
        <div className="section-intro">
          <h2 className="section-heading">Featured Products</h2>
          <div className="heading-accent"></div>
          <p className="section-description">Handpicked items from our collection</p>
        </div>

        <div className="product-layout-grid">
          {featuredProducts.length > 0 ? (
            featuredProducts.map(item => (
              <ProductCard key={item.id} product={item} />
            ))
          ) : (
            <p>Loading featured products...</p>
          )}
        </div>
      </section>

      {/* New Arrivals Section */}
      <section className="product-section">
        <div className="section-intro">
          <h2 className="section-heading">New Arrivals</h2>
          <div className="heading-accent"></div>
          <p className="section-description">Fresh styles just for you</p>
        </div>

        <div className="product-layout-grid">
          {newArrivals.length > 0 ? (
            newArrivals.map(item => (
              <ProductCard key={item.id} product={item} />
            ))
          ) : (
            <p>Loading new arrivals...</p>
          )}
        </div>
      </section>

      {/* Footer */}
      <UserFooter />
    </main>
  );
};

export default Home;
