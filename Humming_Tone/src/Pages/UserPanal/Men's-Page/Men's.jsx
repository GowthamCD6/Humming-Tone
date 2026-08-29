import React, { useState, useEffect } from 'react';
import { SITE_ASSETS } from '../../../utils/siteAssets';
import UserFooter from '../../../components/User-Footer-Card/UserFooter';
import ProductGridSkeleton from '../../../components/ProductSkeleton/ProductSkeleton';
import './Mens.css';

const demoImage = SITE_ASSETS.demoProduct;
import { getGenderOptions } from '../../../utils/siteContentStore';
import axios from 'axios';
import { Link, useSearchParams } from 'react-router-dom';
import { API_BASE_URL, getImageUrl } from '../../../utils/apiConfig';

const Men = ({ onViewDetails: _onViewDetails = () => {} }) => {
  const [searchParams] = useSearchParams();
  const selectedCategory = searchParams.get('category') || '';
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch products from the API for Men's category
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        let url = `${API_BASE_URL}/user/fetch_products?gender=men`;
        if (selectedCategory) {
          url += `&category=${encodeURIComponent(selectedCategory)}`;
        }
        const response = await axios.get(url);
        const fetchedProducts = response.data.map(product => ({
          ...product,
          price: parseFloat(product.price),
          image: getImageUrl(product.image_path),
        }));
        setProducts(fetchedProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory]);

  // Product Card Component
  const ProductCard = ({ product }) => (
    <div className="mens-product-card">
      <div className="mens-product-image-container">
        <img 
          src={product.image} 
          alt={product.name} 
          className="mens-product-img"
          onError={(e) => {
            e.target.onerror = null;
            e.target.style.opacity = '0.5';
          }}
        />
        <div className="mens-product-hover-overlay">
          <Link  className="mens-view-details-btn" to={`/usertab/details/${product.id}`}>VIEW DETAILS</Link>
        </div>
      </div>
      <div className="mens-product-details">
        <h3 className="mens-product-title">{product.name}</h3>
        <p className="mens-product-brand">{product.brand || 'HummingTone'}</p>
        <p className="mens-product-price">₹{product.price.toFixed(2)}</p>
      </div>
    </div>
  );

  return (
    <div className="mens-collection-page">
      {/* Products Section - Conditional Rendering */}
      {loading ? (
        <div className="mens-products-section">
          <div className="mens-section-intro">
            <h2 className="mens-section-heading">
              {selectedCategory ? `Men's ${selectedCategory}` : "Men's Collection"}
            </h2>
            <div className="mens-heading-accent"></div>
          </div>
          <ProductGridSkeleton count={6} />
        </div>
      ) : products.length > 0 ? (
        <div className="mens-products-section">
          <div className="mens-section-intro">
            <h2 className="mens-section-heading">
              {selectedCategory ? `Men's ${selectedCategory}` : "Men's Collection"}
            </h2>
            <div className="mens-heading-accent"></div>
          </div>
          
          <div className="mens-product-grid">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      ) : (
        <div className="mens-no-products-container">
          <h2 className="mens-no-products-title">No Products Found</h2>
          <p className="mens-no-products-text">
            {selectedCategory ? (
              <>No products found in <strong>"{selectedCategory}"</strong>.<br />Try viewing the entire collection.</>
            ) : (
              <>Try adjusting your filters or browse our complete<br />collection.</>
            )}
          </p>
          <Link className="mens-view-all-button" to="/usertab/men">VIEW ALL MEN'S PRODUCTS</Link>
        </div>
      )}
      
      {/* Footer */}
      <UserFooter />
    </div>
  );
};

export default Men;
