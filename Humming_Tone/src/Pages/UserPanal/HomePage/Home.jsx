import React, { useEffect } from 'react';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import homeImage from '../../../assets/home1.png';
import demoImage from '../../../assets/demo.jpeg';
import './Home.css';

// To integrate with backend later, you will just replace these arrays with state from an API
const featuredProducts = [
  { 
    id: 1, 
    name: "Stitch set", 
    brand: "CARE AND DARE", 
    price: 400.00, 
    image: "demo" 
  },
  { 
    id: 2, 
    name: "Blue set", 
    brand: "CARE AND DARE", 
    price: 400.00, 
    image: "demo" 
  },
  { 
    id: 3, 
    name: "Mickey hoodie set", 
    brand: "CARE AND DARE", 
    price: 450.00, 
    image: "demo" 
  },
];

const newArrivals = [
  { 
    id: 4, 
    name: "Christmas sleepsuit", 
    brand: "CARE AND DARE", 
    price: 180.00, 
    image: "demo" 
  },
  { 
    id: 5, 
    name: "Daddy's little one", 
    brand: "CARE AND DARE", 
    price: 180.00, 
    image: "demo" 
  },
  { 
    id: 6, 
    name: "Teddy sleepsuit", 
    brand: "CARE AND DARE", 
    price: 180.00, 
    image: "demo" 
  },
];

const Home = () => {
  
  // Reusable Product Card Component for cleaner code
  const ProductCard = ({ product }) => (
    <div className="product-card">
      <div className="product-image-container">
        {/* Placeholder for actual product image */}
        <img src={product.image === "demo" ? demoImage : product.image} alt={product.name} className="product-img" 
             onError={(e) => { e.target.src = 'https://via.placeholder.com/400x500?text=Product+Image' }} />
        
        <div className="product-hover-overlay">
          <button className="view-details-btn">VIEW DETAILS</button>
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
          <button className="hero-cta-button">SHOP BABY COLLECTION</button>
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
          {featuredProducts.map(item => (
            <ProductCard key={item.id} product={item} />
          ))}
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
          {newArrivals.map(item => (
            <ProductCard key={item.id} product={item} />
          ))}
        </div>
      </section>

    </main>
  );
};

export default Home;