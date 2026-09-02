import React, { useState, useEffect } from 'react';
import UserFooter from '../../../components/User-Footer-Card/UserFooter';
import ProductGridSkeleton from '../../../components/ProductSkeleton/ProductSkeleton';
import ProductCard from '../../../components/ProductCard/ProductCard';
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
          <ProductGridSkeleton count={8} />
        ) : featuredProducts.length > 0 ? (
          <div className="luxury-editorial-grid featured-full-grid">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} fallbackCategory="FEATURED ATELIER" />
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
