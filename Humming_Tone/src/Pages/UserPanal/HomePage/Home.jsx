import React from 'react';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import homeImage from '../../../assets/HomeImage.jpg';
import './Home.css';

const Home = () => {
  const featuredProducts = [
    { 
      id: 1, 
      name: "Stitch set", 
      brand: "Care and Dare", 
      price: "₹400.00",
      image: "product1.jpg" 
    },
    { 
      id: 2, 
      name: "Blue set", 
      brand: "Care and Dare", 
      price: "₹400.00",
      image: "product2.jpg"
    },
    { 
      id: 3, 
      name: "Mickey hoodie set", 
      brand: "Care and Dare", 
      price: "₹450.00",
      image: "product3.jpg"
    },
    { 
      id: 4, 
      name: "Baby Romper", 
      brand: "Care and Dare", 
      price: "₹350.00",
      image: "product4.jpg"
    },
    { 
      id: 5, 
      name: "Kids T-Shirt", 
      brand: "Care and Dare", 
      price: "₹300.00",
      image: "product5.jpg"
    },
    { 
      id: 6, 
      name: "Sports Wear", 
      brand: "Care and Dare", 
      price: "₹500.00",
      image: "product6.jpg"
    },
  ];

  const newArrivals = [
    { 
      id: 7, 
      name: "Christmas sleepsuit", 
      brand: "Care and Dare", 
      price: "₹180.00",
      image: "arrival1.jpg"
    },
    { 
      id: 8, 
      name: "'Daddy's little one' sleepsuit", 
      brand: "Care and Dare", 
      price: "₹180.00",
      image: "arrival2.jpg"
    },
    { 
      id: 9, 
      name: "Teddy sleepsuit", 
      brand: "Care and Dare", 
      price: "₹180.00",
      image: "arrival3.jpg"
    },
    { 
      id: 10, 
      name: "Winter Jacket", 
      brand: "Care and Dare", 
      price: "₹650.00",
      image: "arrival4.jpg"
    },
    { 
      id: 11, 
      name: "Cotton Onesie", 
      brand: "Care and Dare", 
      price: "₹220.00",
      image: "arrival5.jpg"
    },
    { 
      id: 12, 
      name: "Baby Dress", 
      brand: "Care and Dare", 
      price: "₹380.00",
      image: "arrival6.jpg"
    },
  ];

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-image">
          <img src={homeImage} alt="Hero" className="hero-bg-image" />
        </div>
        <div className="hero-content">
          <h1 className="hero-title">Elevate Your Style</h1>
          <p className="hero-subtitle">Discover our curated collection of premium clothing</p>
          <button className="hero-button">SHOP BABY COLLECTION</button>
        </div>
        <div className="scroll-indicator">
          <KeyboardArrowDownIcon />
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="featured-section">
        <div className="section-header">
          <h2 className="section-title">Featured Products</h2>
          <p className="section-subtitle">Handpicked items from our collection</p>
        </div>

        <div className="products-grid">
          {featuredProducts.map((product) => (
            <div key={product.id} className="product-card">
              <div className="product-image">
                <span>Product Image</span>
                <div className="product-overlay">
                  <button className="view-details-btn">VIEW DETAILS</button>
                </div>
              </div>
              <div className="product-info">
                <h3 className="product-name">{product.name}</h3>
                <p className="product-brand">{product.brand}</p>
                <p className="product-price">{product.price}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* New Arrivals Section */}
      <section className="arrivals-section">
        <div className="section-header">
          <h2 className="section-title">New Arrivals</h2>
          <p className="section-subtitle">Fresh styles just for you</p>
        </div>

        <div className="products-grid">
          {newArrivals.map((product) => (
            <div key={product.id} className="product-card">
              <div className="product-image">
                <span>Product Image</span>
                <div className="product-overlay">
                  <button className="view-details-btn">VIEW DETAILS</button>
                </div>
              </div>
              <div className="product-info">
                <h3 className="product-name">{product.name}</h3>
                <p className="product-brand">{product.brand}</p>
                <p className="product-price">{product.price}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;