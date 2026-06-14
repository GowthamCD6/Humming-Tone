import React from 'react';
import UserFooter from '../../../components/User-Footer-Card/UserFooter';
import './AboutUs.css';

const AboutUs = () => {
  return (
    <div className="about-us-page">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="about-hero-content">
          <h1 className="about-hero-title">Our Story</h1>
          <p className="about-hero-subtitle">Crafting fashion with passion since day one</p>
        </div>
      </section>

      {/* About Content */}
      <section className="about-content">
        <div className="about-intro">
          <h2 className="about-section-title">Welcome to Humming Tone</h2>
          <div className="about-accent"></div>
          <p className="about-description">
            At Humming Tone, we believe that fashion is more than just clothing – it's an expression 
            of who you are. Founded with a passion for quality and style, we've dedicated ourselves 
            to bringing you carefully curated collections that blend contemporary trends with timeless elegance.
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="about-grid">
          <div className="about-card">
            <div className="about-card-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                <path d="M2 17l10 5 10-5"></path>
                <path d="M2 12l10 5 10-5"></path>
              </svg>
            </div>
            <h3 className="about-card-title">Our Mission</h3>
            <p className="about-card-text">
              To provide high-quality, stylish clothing that empowers individuals to express their 
              unique personality while maintaining affordability and sustainability.
            </p>
          </div>

          <div className="about-card">
            <div className="about-card-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M12 16v-4"></path>
                <path d="M12 8h.01"></path>
              </svg>
            </div>
            <h3 className="about-card-title">Our Vision</h3>
            <p className="about-card-text">
              To become a leading fashion destination that inspires confidence and celebrates 
              diversity through thoughtfully designed apparel for every occasion.
            </p>
          </div>

          <div className="about-card">
            <div className="about-card-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
            </div>
            <h3 className="about-card-title">Our Values</h3>
            <p className="about-card-text">
              Quality, integrity, and customer satisfaction are at the heart of everything we do. 
              We're committed to ethical practices and sustainable fashion choices.
            </p>
          </div>
        </div>

        {/* Why Choose Us */}
        <div className="about-why-us">
          <h2 className="about-section-title">Why Choose Us</h2>
          <div className="about-accent"></div>
          
          <div className="why-us-grid">
            <div className="why-us-item">
              <span className="why-us-number">01</span>
              <h4 className="why-us-title">Premium Quality</h4>
              <p className="why-us-text">
                Every piece is crafted with attention to detail using the finest materials.
              </p>
            </div>

            <div className="why-us-item">
              <span className="why-us-number">02</span>
              <h4 className="why-us-title">Curated Collections</h4>
              <p className="why-us-text">
                Thoughtfully selected styles that blend current trends with timeless appeal.
              </p>
            </div>

            <div className="why-us-item">
              <span className="why-us-number">03</span>
              <h4 className="why-us-title">Customer First</h4>
              <p className="why-us-text">
                Your satisfaction is our priority with easy returns and dedicated support.
              </p>
            </div>

            <div className="why-us-item">
              <span className="why-us-number">04</span>
              <h4 className="why-us-title">Fast Delivery</h4>
              <p className="why-us-text">
                Quick and reliable shipping to get your favorites to your doorstep.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="about-stats">
          <div className="stat-item">
            <span className="stat-number">10K+</span>
            <span className="stat-label">Happy Customers</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">500+</span>
            <span className="stat-label">Products</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">50+</span>
            <span className="stat-label">Cities Served</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">99%</span>
            <span className="stat-label">Satisfaction Rate</span>
          </div>
        </div>

        {/* CTA Section */}
        <div className="about-cta">
          <h2 className="about-cta-title">Ready to Explore?</h2>
          <p className="about-cta-text">
            Discover our latest collections and find your perfect style today.
          </p>
          <a href="/usertab/all-products" className="about-cta-button">
            Shop Now
          </a>
        </div>
      </section>

      <UserFooter />
    </div>
  );
};

export default AboutUs;