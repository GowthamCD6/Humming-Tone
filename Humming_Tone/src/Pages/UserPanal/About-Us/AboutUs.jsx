import React, { useEffect } from 'react';
import UserFooter from '../../../components/User-Footer-Card/UserFooter';
import aboutHeroImage from '../../../assets/about_hero.jpg';
import aboutHeroVideo from '../../../assets/about_video.mp4';
import aboutDetailImage from '../../../assets/about_detail.jpg';
import craftsmanshipImage from '../../../assets/craftsmanship.jpg';
import { Link } from 'react-router-dom';
import './AboutUs.css';

const AboutUs = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="luxury-about-page">

      {/* ── 1. Hero Banner with Background Video ── */}
      <section className="about-atelier-hero">
        <div className="about-hero-video-wrap">
          <video
            className="about-hero-bg-video"
            autoPlay
            muted
            loop
            playsInline
            poster={aboutHeroImage}
          >
            <source
              src={aboutHeroVideo}
              type="video/mp4"
            />
            {/* Fallback if video doesn't load */}
            <img src={aboutHeroImage} alt="Humming Tone Atelier Studio" />
          </video>
          <div className="about-hero-overlay"></div>
        </div>
        <div className="about-hero-caption">
          <span className="about-hero-subtag">ABOUT HUMMING TONE</span>
          <h1 className="about-hero-headline">A Legacy of Refinement</h1>
        </div>
      </section>

      {/* ── 2. About the Brand ── */}
      <section className="about-brand-section">
        <div className="about-brand-container">
          <div className="about-brand-text">
            <span className="about-section-kicker">THE BRAND</span>
            <h2 className="about-section-title">Born from Passion, Built with Purpose</h2>
            <p className="about-section-body">
              Humming Tone was founded with a singular vision — to create clothing that speaks louder 
              than words. We are not just a fashion label; we are a movement that celebrates individuality 
              through intentional design. From our roots as an independent atelier to becoming a trusted 
              name in contemporary streetwear and bespoke tailoring, our journey has always been 
              guided by authenticity and an unrelenting pursuit of quality.
            </p>
            <p className="about-section-body">
              Every collection we release tells a story, every piece carries the DNA of our 
              brand — bold, considered, and effortlessly modern.
            </p>
          </div>
          <div className="about-brand-visual">
            <div className="about-brand-image-frame">
              <img 
                src={aboutDetailImage} 
                alt="Precision tailoring detail" 
                className="about-brand-img"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. About Our Products ── */}
      <section className="about-product-section">
        <div className="about-product-container">
          <div className="about-product-visual">
            <div className="about-product-image-frame">
              <img 
                src={craftsmanshipImage} 
                alt="Humming Tone atelier craftsmanship" 
                className="about-product-img"
              />
            </div>
          </div>
          <div className="about-product-text">
            <span className="about-section-kicker">OUR PRODUCTS</span>
            <h2 className="about-section-title">Crafted to Last, Designed to Inspire</h2>
            <p className="about-section-body">
              Each Humming Tone garment undergoes a rigorous design process — from initial concept 
              sketches to fabric sourcing, pattern cutting, and final quality inspection. We work 
              exclusively with premium cotton, organic blends, and responsibly sourced materials 
              to deliver products that feel as extraordinary as they look.
            </p>
            <p className="about-section-body">
              Whether it's an oversized streetwear silhouette or a precision-tailored classic, 
              every product carries our commitment to comfort, durability, and style that transcends 
              seasons.
            </p>
            <div className="about-product-cta">
              <Link to="/usertab/all-products" className="about-cta-link">
                <span>EXPLORE COLLECTIONS</span>
                <span className="about-cta-arrow">→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. Our Workers / Team ── */}
      <section className="about-team-section">
        <div className="about-team-container">
          <div className="about-team-header">
            <span className="about-section-kicker">OUR PEOPLE</span>
            <h2 className="about-section-title">The Hands Behind Every Stitch</h2>
            <p className="about-team-intro">
              Behind every Humming Tone garment is a dedicated team of designers, tailors, and 
              artisans who pour their skill and passion into every piece. Our workshop is a 
              collaborative space where creativity meets precision.
            </p>
          </div>

          <div className="about-team-values-grid">
            <div className="team-value-card">
              <span className="team-value-number">01</span>
              <h3 className="team-value-title">Expert Artisans</h3>
              <p className="team-value-desc">
                Our skilled tailors bring decades of combined experience in pattern cutting, 
                hand-finishing, and quality craftsmanship to every garment we produce.
              </p>
            </div>
            <div className="team-value-card">
              <span className="team-value-number">02</span>
              <h3 className="team-value-title">Design Innovation</h3>
              <p className="team-value-desc">
                Our design team stays ahead of global trends while staying true to our brand 
                identity — merging streetwear edge with refined elegance.
              </p>
            </div>
            <div className="team-value-card">
              <span className="team-value-number">03</span>
              <h3 className="team-value-title">Fair Workspace</h3>
              <p className="team-value-desc">
                We are committed to ethical working conditions, fair wages, and a supportive 
                environment where every team member can thrive and grow.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. Our Customers ── */}
      <section className="about-customers-section">
        <div className="about-customers-container">
          <div className="about-customers-text">
            <span className="about-section-kicker">OUR COMMUNITY</span>
            <h2 className="about-section-title">You Are the Movement</h2>
            <p className="about-section-body">
              Our customers are not just buyers — they are the heartbeat of Humming Tone. From 
              college students expressing their identity to professionals who demand quiet luxury, 
              our community spans ages, styles, and stories. We listen, we evolve, and we design 
              with you in mind.
            </p>
            <p className="about-section-body">
              Every review, every photo you share, and every repeat order fuels our passion to 
              keep pushing boundaries. This brand exists because of you.
            </p>
          </div>

          <div className="about-customers-stats">
            <div className="customer-stat-item">
              <span className="about-stat-value">10K+</span>
              <span className="about-stat-label">Happy Customers</span>
            </div>
            <div className="customer-stat-item">
              <span className="about-stat-value">500+</span>
              <span className="about-stat-label">Unique Products</span>
            </div>
            <div className="customer-stat-item">
              <span className="about-stat-value">50+</span>
              <span className="about-stat-label">Cities Served</span>
            </div>
            <div className="customer-stat-item">
              <span className="about-stat-value">99%</span>
              <span className="about-stat-label">Satisfaction Rate</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. CTA Banner ── */}
      <section className="about-final-cta-section">
        <div className="about-final-cta-container">
          <h2 className="about-final-cta-title">Ready to Experience Humming Tone?</h2>
          <p className="about-final-cta-desc">
            Discover our latest collections and find your perfect style today.
          </p>
          <Link to="/usertab/all-products" className="about-final-cta-btn">
            SHOP NOW
          </Link>
        </div>
      </section>

      {/* Footer */}
      <UserFooter />
    </div>
  );
};

export default AboutUs;